import { FillOptions } from "./interfaces/fillOptions"
import Recognizer from "./src/recognizer"

import Texts from "./src/texts"
import Permissions from "./src/permissions"
import InputsBusinessRules from "./src/inputsBusinessRules"
import Validator from "./src/validator"

var recognizer:Recognizer = new Recognizer()
let texts = Texts["pt-Br"]

export const fillForm = async (formId: string,options:FillOptions = {lang:'pt-BR'}) => {
    try{

        //Object para interação com as funções de áudio
        recognizer = new Recognizer(options)

        //Textos prontos que serão falados
        texts = Texts[options.lang]
        
        //Busca 
        const form: HTMLElement = document.getElementById(formId) as HTMLElement
        if(!form) console.log({errorMessage:texts.function.formIdError})
    

        requestPermissions()
            .then(async (stream) => {
                //Para o áudio que está rodando caso tenha um
                stream.getAudioTracks()[0].stop();


                //Propriedade que vai dar a introdução do formulário
                let va_form_description = form.getAttribute("va_form_description");

                if (va_form_description) {
                    recognizer.speak(va_form_description);
                } else {
                    recognizer.speak(texts.form.start);
                }

                recognizer.speak(texts.form.bipWarning);

                //Pega todos elementos de input do formulário
                const elements = form.querySelectorAll('input, textarea, select');

                //Itera todos esses elementos
                elements.forEach(element => {
                    fillField(element)
                })

                await finishForm(form)
                
                })
                .catch(error => {
                    recognizer.speak (texts.permissions.microphoneRejected);
                    console.error('Microphone permision error:', error);
                })
    }
    catch(error){

    }
}

 //Função de ler e inserir o campo
const fillField = async (field: Element) => {
    const voicePrompt = field.getAttribute('voice');
    const placeholderText = field.getAttribute('placeholder');
    const businessRules = InputsBusinessRules[field.getAttribute("type") as string]
    var txt = voicePrompt ? voicePrompt : placeholderText
    
    if(businessRules){
        txt = businessRules(field, texts)
    }
    
    await recognizer.speak(txt)
    return recognizer.listen()
        .then((event:any) => {
            let transcript = event.results[0][0]?.transcript;

            Validator[field.getAttribute("type") as string](transcript,texts,field)
                .then(response => { 
                    if(response.processed) field.setAttribute("value", transcript); 
                })
                .catch(async response => {
                    await recognizer.speak(response.errorMessage)
                    return fillField(field)
                })


        })
}

const requestPermissions = async () : Promise<MediaStream> => {
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

    return Permissions.requestPermission({ audio: true })
    
}

const finishForm = async (form: HTMLElement) => {
    await recognizer.speak(texts.form.finishFormQuestion)

    return recognizer.listen()
        .then((event:any) => {
            let transcript = event.results[0][0].transcript;

            if (transcript.toLowerCase().includes('sim enviar')){
                (form as any).submit();
            }
        })

}