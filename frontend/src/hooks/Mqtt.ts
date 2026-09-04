import mqtt from "mqtt";
import { useEffect, useState } from "react";

export function MqttConnection(){
    const mqttHost = import.meta.env.VITE_MQTT_HOST;
    const mqttUsername = import.meta.env.VITE_MQTT_USERNAME;
    const mqttPassword = import.meta.env.VITE_MQTT_PASSWORD;
    const [time,setTime]= useState("");
    const [sensorData,setsensorData] = useState<any>(null);
    const [cameraUrl, setcameraUrl] = useState("");
    useEffect(() => { 
        const client = mqtt.connect(mqttHost, {
        username: mqttUsername,
        password: mqttPassword
        })
        client.subscribe(["pi5/iot/data","pi5/iot/motion","pi5/cloudfare/url"])
        client.on("message",(topic,payload)=>{
            switch(topic){
                case "pi5/cloudfare/url":
                    try{
                        setcameraUrl(payload.toString());
                    }catch(error){
                        console.log(error);
                    }
                    break
                case "pi5/iot/data":
                    try{
                        setsensorData(JSON.parse(payload.toString()));
                    }catch(error){
                        console.error(error);
                    }
                    break
                case "pi5/iot/motion":
                    setTime(payload.toString());
                    break
                    
            }
        })
        return () => { if (client) client.end(); };
    },[]);
    return {
        cameraUrl,
        sensorData,
        time
    };

}

