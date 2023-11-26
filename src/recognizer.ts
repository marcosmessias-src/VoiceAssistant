import { FillOptions } from "../interfaces/fillOptions";

class Recognizer{
    private recognition:any = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    private va_audio= new Audio('/beep.mp3');
    private microfonePermissionStatus:string
    

    constructor(options:FillOptions = {lang:'pt-BR'}){
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

   

    speak(text) : Promise<SpeechSynthesisEvent>{
        return new Promise((resolve, reject) => {

            const speaker :SpeechSynthesisUtterance =new SpeechSynthesisUtterance(text) 

            window.speechSynthesis.speak(speaker);

            speaker.onend = (event) => resolve(event)
            speaker.onerror = (event) => reject(event)
        })

    }

    listen(){
        return new Promise((resolve, reject) => {
            this.va_audio.play();
            
            this.recognition.onresult = (event) => {
                resolve(event)
            }
            
            this.recognition.onerror = (event) => {
                reject(event)
            }

            this.recognition.start();
        })


        
    }


}

export default Recognizer