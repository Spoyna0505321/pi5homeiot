import time
import json 
from gpiozero import MotionSensor
class MotionData:
    def __init__(self):
        self.sensor = MotionSensor(27)
        self.motion = False
        self.sensor.when_motion = self.on_motion
        self.sensor.when_no_motion = self.when_no_motion
    def on_motion(self):
        self.motion =  True
    def when_no_motion(self):
        self.motion =  False