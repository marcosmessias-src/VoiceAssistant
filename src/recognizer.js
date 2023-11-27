

class Recognizer{
    recognition = new (window["SpeechRecognition"] || window["webkitSpeechRecognition"])();
    va_audio= new Audio('../assets/beep.mp3');
    microfonePermissionStatus
    

    constructor(options = {lang:'pt-BR'}){
        Object.entries(options).forEach(([key,value]) => {
            this.recognition[key] = value
        })

        this.onEnd((event) => {
            this.recognition.onend = null;
            this.recognition.stop();
            return;
        })
    }

    onEnd(trigger) {
        this.recognition.onend = trigger
    }

   

    speak(text) {
        return new Promise((resolve, reject) => {
            const speaker=new SpeechSynthesisUtterance(text) 
            
            window.speechSynthesis.speak(speaker);
            
           speaker.onend = () => resolve()
           speaker.onerror = () => reject()
        })

    }

    async listen(){
        return new Promise((resolve, reject) => {
            this.va_audio.play();
            
            this.recognition.onresult = (event) => resolve(event)
            
            
            this.recognition.onerror = (event) => reject(event)
            

            this.recognition.start();

        })


        
    }


}

export default Recognizer