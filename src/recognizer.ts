import { FillOptions } from "../interfaces/fillOptions";

class Recognizer{
    private recognition:any = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    private va_audio= new Audio('/beep.mp3');
    private microfonePermissionStatus:string
    

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

    onEnd(trigger:(event) => void) : void{
        this.recognition.onend = trigger
    }

    onError(trigger:(event) => void) : void{
        this.recognition.onerror = trigger
    }

    onResult(trigger:(event) => void) : void{
        this.recognition.onresult = trigger
    }

    speak(text) : Promise<SpeechSynthesisEvent>{
        return new Promise((resolve, reject) => {

            const speaker :SpeechSynthesisUtterance =new SpeechSynthesisUtterance(text) 

            window.speechSynthesis.speak(speaker);

            speaker.onend = (event) => resolve(event)
            speaker.onerror = (event) => reject(event)
        })

    }

    listen(){
        this.va_audio.play();
        this.recognition.start();
    }


}

export default Recognizer