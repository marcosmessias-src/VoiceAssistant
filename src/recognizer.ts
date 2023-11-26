import { FillOptions } from "../interfaces/fillOptions";

class Recognizer{
    recognition:any = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    
    constructor(options:FillOptions = {}){
        Object.entries(options).forEach(([key,value]) => {
            this.recognition[key] = value
        })
    }
}

export default Recognizer