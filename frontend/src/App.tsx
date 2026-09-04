import {  useRef, useState } from 'react';
import './App.css'
import {MqttConnection} from "./hooks/Mqtt"
import axios from "axios";
import { 
  Cpu, 
  Thermometer, 
  Droplets, 
  Eye, 
  Video, 
  VideoOff, 
  Maximize2, 
  Circle, 
  RefreshCw 
} from 'lucide-react';
function App() {
  const {cameraUrl,sensorData,time} = MqttConnection();
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  async function Api() {
  try {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;
    pc.ontrack = (event) => {


      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setIsStreamActive(true);
      }
    };

    const response = await axios.post(
      `${cameraUrl}/webrtc`,
      {
        type: "request",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    await pc.setRemoteDescription(
      new RTCSessionDescription({
        type: response.data.type,
        sdp: response.data.sdp,
      })
    );

    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);
    await axios.post(
      `${cameraUrl}/webrtc`,
      {
        type: "answer",
        id: response.data.id,
        sdp: answer.sdp,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
}
  function disableCamera() {
    const pc = peerConnectionRef.current;
    console.log(cameraUrl);
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pc.close();
      peerConnectionRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreamActive(false);
  }

  return (
  <div className="min-h-screen w-full bg-[#070a12] text-slate-200 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 selection:bg-blue-500/30">

    {/* HEADER */}
    <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800/80 pb-6 mb-8 gap-5">

      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Secure IoT Dashboard
            </h1>

            <p className="text-xs text-slate-400 mt-1 tracking-wide">
              ESP8266 + Raspberry Pi 5 + Django + MQTT
            </p>
          </div>
        </div>
      </div>

      {/* Last update */}
      <div className="flex items-center gap-3 bg-[#0d1422] px-4 py-2.5 rounded-xl border border-slate-800 shadow-lg">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <RefreshCw className="relative w-4 h-4 text-emerald-400" />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            System Status
          </p>

          <p className="text-xs font-mono text-slate-300">
            Last Update: {new Date().toLocaleTimeString("en-US")}
          </p>
        </div>
      </div>

    </header>


    {/* SENSOR CARDS */}
    <main className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">

      {/* TEMPERATURE */}
      <div className="group bg-[#0c1321] border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/5">

        <div className="flex justify-between items-start mb-5">

          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Temperature
            </p>

            <p className="text-[11px] text-slate-600 mt-1">
              DHT11 Sensor
            </p>
          </div>

          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Thermometer className="w-5 h-5" />
          </div>

        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            {sensorData?.temperature ?? "--"}
          </span>

          <span className="text-lg font-bold text-blue-400">
            °C
          </span>
        </div>

        <div className="w-full bg-slate-900 h-2 rounded-full mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                (Number(sensorData?.temperature ?? 0) / 50) * 100
              )}%`,
            }}
          />
        </div>

      </div>


      {/* HUMIDITY */}
      <div className="group bg-[#0c1321] border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5">

        <div className="flex justify-between items-start mb-5">

          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Humidity
            </p>

            <p className="text-[11px] text-slate-600 mt-1">
              DHT11 Sensor
            </p>
          </div>

          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Droplets className="w-5 h-5" />
          </div>

        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            {sensorData?.humidity ?? "--"}
          </span>

          <span className="text-lg font-bold text-emerald-400">
            %
          </span>
        </div>

        <div className="w-full bg-slate-900 h-2 rounded-full mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Number(sensorData?.humidity ?? 0)
              )}%`,
            }}
          />
        </div>

      </div>


      {/* MOTION */}
      <div className="group bg-[#0c1321] border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/5">

        <div className="flex justify-between items-start mb-5">

          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Motion Detection
            </p>

            <p className="text-[11px] text-slate-600 mt-1">
              PIR Sensor
            </p>
          </div>

          <div
            className={`p-2.5 border rounded-xl transition-all ${
              sensorData?.motion_detected
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                : "bg-slate-800/50 border-slate-700 text-slate-400"
            }`}
          >
            <Eye className="w-5 h-5" />
          </div>

        </div>

        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
              sensorData?.motion_detected
                ? "text-purple-400"
                : "text-white"
            }`}
          >
            {sensorData?.motion_detected ? "ACTIVE" : "IDLE"}
          </span>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  sensorData?.motion_detected
                    ? "bg-rose-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              />

              <span className="text-xs text-slate-300 font-medium">
                {sensorData?.motion_detected
                  ? "Motion Detected"
                  : "Room Secured"}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Last Motion Detected
            </p>

            <p className="text-sm font-mono text-slate-200 mt-1">
              {time ?? "No motion detected yet"}
            </p>
          </div>

        </div>

      </div>

    </main>


    {/* CAMERA SECTION */}
    <section className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* CAMERA */}
      <div className="xl:col-span-2 bg-[#0c1321] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">

        {/* CAMERA HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">

          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              Raspberry Pi 5 Live Feed
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Real-time camera monitoring
            </p>
          </div>


          <div className="flex items-center gap-2">

            {isStreamActive && (
              <>
                <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-800">
                  1080P
                </span>

                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  30 FPS
                </span>
              </>
            )}

            <span
              className={`flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full border ${
                isStreamActive
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-slate-800/70 text-slate-400 border-slate-700"
              }`}
            >
              <Circle
                className={`w-2 h-2 ${
                  isStreamActive
                    ? "fill-rose-500 text-rose-500"
                    : "fill-slate-500 text-slate-500"
                }`}
              />

              {isStreamActive ? "LIVE" : "OFFLINE"}
            </span>

          </div>

        </div>


        {/* VIDEO */} <div className="relative aspect-video w-full bg-[#05080f] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center group"> {/* VIDEO */} <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${ isStreamActive ? "block" : "hidden" }`} /> {/* DISCONNECTED STATE */} {!isStreamActive && ( <div className="text-center p-6"> <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center"> <VideoOff className="w-7 h-7 text-slate-500" /> </div> <p className="text-sm font-semibold text-slate-300"> Stream Disconnected </p> <p className="text-xs text-slate-500 mt-1"> Enable the camera to start streaming </p> </div> )} {/* VIDEO OVERLAY */} {isStreamActive && ( <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end justify-between"> <span className="text-[11px] text-slate-300 font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700"> CAM_NODE_05_PI5 </span> <button onClick={() => { if (videoRef.current) { videoRef.current.requestFullscreen(); } }} className="p-2.5 bg-black/70 hover:bg-slate-800 backdrop-blur-md text-white rounded-lg border border-slate-700 transition-colors" > <Maximize2 className="w-4 h-4" /> </button> </div> )} </div>


        {/* CAMERA CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-800">

          <button
            onClick={isStreamActive ? disableCamera : Api}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] ${
              isStreamActive
                ? "bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
            }`}
          >
            {isStreamActive ? "Disable Camera" : "Enable Camera"}
          </button>


          <button
            disabled={!isStreamActive}
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${
              isRecording
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >

            <Circle
              className={`w-2.5 h-2.5 ${
                isRecording
                  ? "fill-rose-500 text-rose-500 animate-pulse"
                  : "text-slate-400"
              }`}
            />

            {isRecording ? "Recording..." : "Record Stream"}

          </button>

        </div>

      </div>


      {/* SYSTEM STATUS PANEL */}
      <div className="xl:col-span-1 bg-[#0c1321] border border-slate-800 rounded-2xl p-5 sm:p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-lg font-bold text-white">
              System Status
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Connected devices
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>

        </div>


        <div className="space-y-3">

          {/* DEVICE */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Raspberry Pi 5
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Main IoT Controller
              </p>
            </div>

            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              ONLINE
            </span>

          </div>


          {/* MQTT */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">

            <div>
              <p className="text-sm font-semibold text-slate-200">
                MQTT Broker
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                HiveMQ Cloud
              </p>
            </div>

            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              CONNECTED
            </span>

          </div>

        </div>


        {/* DIVIDER */}
        <div className="border-t border-slate-800 my-6" />


        {/* SENSOR STATUS */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Sensor Status
          </p>

          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                DHT11
              </span>

              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                PIR Motion
              </span>

              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                MQ-2 Gas
              </span>

              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Active
              </span>
            </div>

          </div>
        </div>

      </div>

    </section>

  </div>
);
}
export default App;