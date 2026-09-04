import time
import json
from dht11 import DHT11
from motion_sensor import MotionData
from mqtt import MqttConnection
from datetime import datetime
import subprocess
import re
def get_tunnel_url():
    pattern = re.compile(
        r"https://[a-zA-Z0-9-]+\.trycloudflare\.com"
    )

    while True:
        result = subprocess.run(
            [
                "journalctl",
                "-u",
                "cloudflared-quick.service",
                "--no-pager"
            ],
            capture_output=True,
            text=True
        )

        urls = pattern.findall(result.stdout)

        urls = [
            url for url in urls
            if "api.trycloudflare.com" not in url
        ]

        if urls:
            return urls[-1]

        print("Waiting for Cloudflare Tunnel URL...")
        time.sleep(2)
motion_sensor = MotionData()
client = MqttConnection()
dht11 = DHT11()
client.connect()
tunnel_url = get_tunnel_url()
print("Tunnel URL:", tunnel_url)
client.publish("pi5/cloudfare/url",tunnel_url,retain=True)
while True:
    try:
        if (motion_sensor.motion == True):
            now = datetime.now().strftime("%d-%m-%Y %H:%M")
            client.publish("pi5/iot/motion",now)
    except Exception as e:
        print("Motion sensor error:", e)
    try:
        data = dht11.read_sensor_data()
        client.publish("pi5/iot/data",data)
        time.sleep(5)
    except RuntimeError as e:
        print("DHT11 error:", e)
    except Exception as e:
        print("Unexpected DHT11 error:", e)