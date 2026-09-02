import board
import adafruit_dht
import time
import json 
class DHT11:
    def __init__(self):
        self.dhtDevice = adafruit_dht.DHT11(board.D17,use_pulseio=False)
        self.temperature = 0
        self.humidity = 0
    def read_sensor_data(self):
        try:
           self.temperature = self.dhtDevice.temperature
           self.humidity = self.dhtDevice.humidity
        except RuntimeError as error:
            print(error.args[0])
            time.sleep(2.0)
        except Exception as error:
            self.dhtDevice.exit()
            raise error
        finally:
            self.dhtDevice.exit()
        return json.dumps({"temperature":self.temperature,"humidity":self.humidity})
