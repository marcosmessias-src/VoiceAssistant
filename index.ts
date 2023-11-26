import { FillOptions } from "./interfaces/fillOptions"
import Recognizer from "./src/recognizer"

import Texts from "./src/texts"
import Permissions from "./src/permissions"
import InputsBusinessRules from "./src/inputsBusinessRules"


const fillField = (field: Element, recognizer:Recognizer, texts) => {
    const voicePrompt = field.getAttribute('voice');
    const placeholderText = field.getAttribute('placeholder');
    const businessRules = InputsBusinessRules[field.getAttribute("type") as string]
    var txt = voicePrompt ? voicePrompt : placeholderText
    
    if(businessRules){
        txt = businessRules(field, texts)
    }
    
    recognizer.speak(texts.form.termsRequest)



}

export const fillForm = async (form: HTMLElement,options:FillOptions = {lang:'pt-BR'}) => {
    try{
        var recognizer:Recognizer = new Recognizer(options)
        const texts = Texts[options.lang]

        //Recurso não aceito pelo navegador Microsoft
        await Permissions.checkPermission({name: 'microphone'})
            .then((permissionStatus:PermissionStatus) => {
                if (permissionStatus.state != 'granted') {
                    recognizer.speak(texts.permissions.microphoneRequest)
                }
            })
            .catch(error => {
                console.log("Microphone check errorr", error)
            })
        
        Permissions.requestPermission({ audio: true })
            .then((stream) => {
                stream.getAudioTracks()[0].stop();

                let va_form_description = form.getAttribute("va_form_description");

                if (va_form_description) {
                    recognizer.speak(va_form_description);
                } else {
                    recognizer.speak(texts.form.start);
                }

            recognizer.speak (texts.permissions.bipWarning);

            const elements = form.querySelectorAll('input, textarea, select');

            elements.forEach(element => {
                fillField(element,recognizer,texts)
            })

            })
            .catch(error => {
                recognizer.speak (texts.permissions.microphoneRejected);
                console.error('Microphone permision error:', error);
            })
    }
    catch(error){

    }
    
        
    

}