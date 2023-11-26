import { FillOptions } from "../interfaces/fillOptions";

class Recognizer{
    private recognition:any = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    

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

    speak(text){
        return new Promise((resolve, reject) => {
            const speaker :SpeechSynthesisUtterance =new SpeechSynthesisUtterance(text) 

            window.speechSynthesis.speak(speaker);

            speaker.onend = (event) => resolve(event)
            speaker.onerror = (event) => reject(event)
        })

    }


}

export default Recognizer