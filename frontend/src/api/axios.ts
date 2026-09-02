import axios from "axios";
export async function Api(){
    try{
        const response = await axios.post("https://192.168.1.12/webrtc");
        console.log(response.data.title);
    }catch(err:any){
        console.log(err);
    }
}
