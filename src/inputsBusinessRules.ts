const InputsBusinessRules = {
    checkbox:(field: Element, texts) => {
        let voicePrompt = field.getAttribute('voice');

        if(voicePrompt && field.getAttribute("va_fill_field")){
            voicePrompt = `${voicePrompt} ${texts.form.term}`;
        }

        return voicePrompt
        
    }
}

export default InputsBusinessRules