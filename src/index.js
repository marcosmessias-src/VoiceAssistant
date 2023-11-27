
import Recognizer from "./recognizer.js"

import Texts from "./texts.js"
import Permissions from "./permissions.js"
import InputsBusinessRules from "./inputsBusinessRules.js"
import Validator from "./validator.js"

var recognizer= new Recognizer()
let texts = Texts["pt-Br"]


export const fillForm = async (formId,options = {lang:'pt-Br'}) => {
    try{

        //Object para interação com as funções de áudio
        recognizer = new Recognizer(options)

        //Textos prontos que serão falados

        
        texts = Texts[options.lang]
        //Busca 
        const form = document.getElementById(formId) 
        if(!form) console.log({errorMessage:texts.function.formIdError})
    
        requestPermissions()
        .then(async (stream) => {
            
            //Para o áudio que está rodando caso tenha um
                
                stream.getAudioTracks()[0].stop();


                //Propriedade que vai dar a introdução do formulário
                let va_form_description = form.getAttribute("va_form_description");

                if (va_form_description) {
                    await recognizer.speak(va_form_description);
                } else {
                    await recognizer.speak(texts.form.start);
                }

                await recognizer.speak(texts.form.bipWarning);

                //Pega todos elementos de input do formulário
                const elements = form.querySelectorAll('input, textarea, select');

                //Itera todos esses elementos
                
                await iterateFields(elements)

                finishForm(form)
                
                
                })
                .catch(error => {
                    recognizer.speak (texts.permissions.microphoneRejected);
                    console.error('Microphone permision error:', error);
                })
    }
    catch(error){

    }
}

const iterateFields = (fields, index = 0) => {

    if(fields[index]){
        return fillField(fields[index])
            .then(result => {
                return iterateFields(fields, index+1)
            })
            .catch(error => console.log("error: ", error))
    }
        
}

 //Função de ler e inserir o campo
const fillField = async (field) => {
    const voicePrompt = field.getAttribute('voice');
    const placeholderText = field.getAttribute('placeholder');
    const businessRules = InputsBusinessRules[field.getAttribute("type")]
    var txt = voicePrompt ? voicePrompt : placeholderText
    
    if(businessRules){
        txt = businessRules(field, texts)
    }
    
    await recognizer.speak(txt)
    return recognizer.listen()
        .then(async (event) => {
            let transcript = event.results[0][0]?.transcript;
            const validator = Validator[field.getAttribute("type")]
            if(validator){
                await validator(transcript,texts,field)
                    .then(response => { 
                        if(response.processed)  {
                            transcript = response.text
                        } ; 
                    })
                    .catch(async response => {
                        await recognizer.speak(response.errorMessage)
                        return fillField(field)
                    })
            }
            
            field.setAttribute("value", transcript); 
            


        })
}

const requestPermissions = async ()=> {
    //Recurso não aceito pelo navegador Microsoft
    await Permissions.checkPermission({name: 'microphone'})
    .then((permissionStatus) => {
        if (permissionStatus.state != 'granted') {
            recognizer.speak(texts.permissions.microphoneRequest)
        }
    })
    .catch(error => {
        console.log("Microphone check errorr", error)
    })

    return Permissions.requestPermission({ audio: true })
    
}

const finishForm = async (form) => {
    await recognizer.speak(texts.form.finishFormQuestion)

    return recognizer.listen()
        .then((event) => {
            let transcript = event.results[0][0].transcript;

            if (transcript.toLowerCase().includes('sim enviar')){
                form.submit();
            }
        })

}