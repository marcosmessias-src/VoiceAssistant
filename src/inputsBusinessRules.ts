const InputsBusinessRules = {
    checkbox:(field: Element, texts) => {
        let voicePrompt = field.getAttribute('voice');

        if(voicePrompt && field.getAttribute("va_fill_field")){
            voicePrompt = `${voicePrompt} ${texts.form.term}`;
        }

        return voicePrompt
        
    },
    password:(field: Element, texts) => {
        (field as any).focus();

        field.addEventListener("keydown", function(event) {

            if ((event as any).keyCode === 9) {
              
            }
        });
    }
}

export default InputsBusinessRules