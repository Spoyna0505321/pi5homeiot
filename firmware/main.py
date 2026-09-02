import time
import json
from dht11 import DHT11
from motion_sensor import MotionData
from mqtt import MqttConnection
from datetime import datetime
motion_sensor = MotionData()
client = MqttConnection()
dht11 = DHT11()
client.connect()
while True:
    try:
        if (motion_sensor.motion == True):
            now = datetime.now().strftime("%d-%m-%Y %H:%M")
            client.publish("pi5/iot/motion",now)
        data = dht11.read_sensor_data()
        client.publish("pi5/iot/data",data)
        time.sleep(5)
    except RuntimeError as e:
        print("Sensor error:", e)