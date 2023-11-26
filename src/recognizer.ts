import { FillOptions } from "../interfaces/fillOptions";

class Recognizer{
    recognition:any = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    
    constructor(options:FillOptions = {}){
        Object.entries(options).forEach(([key,value]) => {
            this.recognition[key] = value
        })

        this.onEnd((event) => {
            this.recognition.onend = null;
            this.recognition.stop();
            return;
        })
    }

    onEnd(trigger:(event) => void){
        this.recognition.onend = trigger
    }

    onError(trigger:(event) => void){
        this.recognition.onerror = trigger
    }

    onResult(trigger:(event) => void){
        this.recognition.onresult = trigger
    }


}

export default Recognizer