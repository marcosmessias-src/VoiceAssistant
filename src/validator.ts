const Validator = {
    email:(transcript, texts, field) => {
        return new Promise((resolve,reject) => {
            let txtNoSpace = transcript.replace(/\s/g, '');
            let txtLower = txtNoSpace.toLowerCase();
            
            if(txtLower){
                resolve({text: txtLower, processed: false})
            }
            else{
                reject({errorMessage: texts.form.invalidEmail})
            }
        
        })
    },
    checkbox:(transcript,texts, field) => {
        return new Promise((resolve,reject) => {
            if(field.getAttribute("va_fill_field") == 'terms' && transcript.toLowerCase().includes('sim aceito')){
                field.checked = true;
            }

            resolve({text: transcript, processed: true})
        })
    }
}

export default Validator