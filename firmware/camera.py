import argparse
import asyncio
import json
import logging
import os
import ssl
import uuid
import time
import aiohttp_cors
import av
from fractions import Fraction
from picamera2 import Picamera2

from aiohttp import web
from aiortc import (
    RTCPeerConnection,
    RTCSessionDescription,
    MediaStreamTrack,
)


ROOT = os.path.dirname(__file__)

pcs = {}

cam = Picamera2()

video_config = cam.create_video_configuration(
    main={"format": "RGB888"}
)

cam.configure(video_config)
cam.start()


class PiCameraTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self):
        super().__init__()

    async def recv(self):
        img = cam.capture_array()
        new_frame = av.VideoFrame.from_ndarray(
            img,
            format="rgb24"
        )
        pts = int(time.time() * 1000000)

        new_frame.pts = pts
        new_frame.time_base = Fraction(1, 1000000)

        return new_frame

async def webrtc(request):

    params = await request.json()

    if params["type"] == "request":

        pc = RTCPeerConnection()

        pc_id = "PeerConnection(%s)" % uuid.uuid4()

        pcs[pc_id] = pc

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():

            print(
                "Connection state is %s"
                % pc.connectionState
            )

            if pc.connectionState == "failed":

                await pc.close()

                if pc_id in pcs:
                    del pcs[pc_id]

        camera_track = PiCameraTrack()

        pc.addTrack(camera_track)

        offer = await pc.createOffer()

        await pc.setLocalDescription(offer)

        while pc.iceGatheringState != "complete":
            await asyncio.sleep(0.1)

        @pc.on("signalingstatechange")
        async def on_signalingstatechange():

            print(
                "Signaling state is %s"
                % pc.signalingState
            )

        return web.Response(
            content_type="application/json",
            text=json.dumps(
                {
                    "sdp": pc.localDescription.sdp,
                    "type": pc.localDescription.type,
                    "id": pc_id,
                    "iceServers": []
                }
            )
        )


    elif params["type"] == "answer":

        pc_id = params["id"]

        pc = pcs.get(pc_id)

        if pc is None:

            return web.Response(
                content_type="application/json",
                status=404,
                text=json.dumps(
                    {
                        "error": "Peer connection not found"
                    }
                )
            )

        await pc.setRemoteDescription(
            RTCSessionDescription(
                sdp=params["sdp"],
                type=params["type"]
            )
        )

        return web.Response(
            content_type="application/json",
            text=json.dumps({})
        )

    return web.Response(
        content_type="application/json",
        status=400,
        text=json.dumps(
            {
                "error": "Invalid request type"
            }
        )
    )



async def on_shutdown(app):

    coros = [
        pc.close()
        for pc in pcs.values()
    ]

    if coros:
        await asyncio.gather(*coros)

    pcs.clear()

    try:
        cam.stop()
    except Exception:
        pass


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Raspberry Pi WebRTC Camera Streamer"
    )

    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host for HTTP server"
    )

    parser.add_argument(
        "--port",
        type=int,
        default=8080,
        help="Port for HTTP server"
    )

    parser.add_argument(
        "--cert-file",
        default=None,
        help="SSL certificate file"
    )

    parser.add_argument(
        "--key-file",
        default=None,
        help="SSL private key file"
    )

    parser.add_argument(
        "--verbose",
        "-v",
        action="count",
        default=0
    )

    args = parser.parse_args()


    if args.verbose:
        logging.basicConfig(
            level=logging.DEBUG
        )
    else:
        logging.basicConfig(
            level=logging.INFO
        )


    ssl_context = None

    if args.cert_file and args.key_file:

        ssl_context = ssl.SSLContext(
            ssl.PROTOCOL_TLS_SERVER
        )

        ssl_context.load_cert_chain(
            args.cert_file,
            args.key_file
        )


    app = web.Application()

    app.on_shutdown.append(
        on_shutdown
    )
    webrtc_route = app.router.add_post("/webrtc", webrtc)

    cors = aiohttp_cors.setup(
        app,
        defaults={
            "url": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                allow_headers="*",
                allow_methods=["POST", "OPTIONS"],
            )
        },
    )

    cors.add(webrtc_route)




    web.run_app(
        app,
        host=args.host,
        port=args.port,
        ssl_context=ssl_context
    )