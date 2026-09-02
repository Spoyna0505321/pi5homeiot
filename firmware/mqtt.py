import paho.mqtt.client as mqtt
import paho.mqtt.subscribe as subscribe
import time
import json
MQTT_BROKER = ""
MQTT_PORT = ""
MQTT_USERNAME = ""
MQTT_PASSWORD = ""
class MqttConnection:
    def __init__(self):
        self.username = MQTT_USERNAME
        self.password = MQTT_PASSWORD
        self.broker = MQTT_BROKER
        self.port = MQTT_PORT   
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.client.username_pw_set(self.username,self.password)
        self.client.tls_set()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message       
    def connect(self):
        self.client.connect(self.broker,self.port,60)
        self.client.loop_start()
    def on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code.is_failure:
            print("MQTT connection failed:", reason_code)
        else:
            print("MQTT connected")
    def publish(self,topic,message):
        self.client.publish(topic, message, qos=1)
    def subscribe(self,topic):
        self.client.subscribe(topic)
    def on_message(self, client, userdata, message):
        payload = message.payload.decode()
        print(
            f"MQTT message: {message.topic} -> {payload}"
        ) 