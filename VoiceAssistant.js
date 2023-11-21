function va_validEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function va_emailField(txt) {
    let txtNoSpace = txt.replace(/\s/g, '');
    let txtLower = txtNoSpace.toLowerCase();
    return txtLower;
}

function va_passwordField(txt) {
    let password = txt.replace(/\s/g, '');
    return password;
}

document.addEventListener('DOMContentLoaded', function() {

    var va_audio = new Audio('/beep.mp3');

    if ('speechSynthesis' in window) {
        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;

        const va_fill_buttons = document.querySelectorAll('button[va_fill_form]');

        va_fill_buttons.forEach(button => {
            button.addEventListener('click', function() {

                const formId = this.getAttribute('va_fill_form');
                const form = document.getElementById(formId);

                var speak_tries = 0;

                var field;
                var fieldIndex = -1;
                var formCompleted = false;

                recognition.onend = (event) => {
                    recognition.onend = null;
                    recognition.stop();
                    return;
                }

                recognition.onerror = (event) => {
                    if(event.error == 'no-speech'){
                        if (speak_tries < 2){
                            va_speak('Não entendi.');
                            fillNextField(fieldIndex -= 1);
                            speak_tries += 1
                        }else{
                            va_speak('Não entendi novamente.');
                            va_speak('Suas tentativas de preenchimento excederam o limite.');
                        }
                    }else if(event.error == 'bad-grammar'){
                        if (speak_tries < 2){
                            va_speak('Não compreendi.');
                            fillNextField(fieldIndex -= 1);
                            speak_tries += 1
                        }else{
                            va_speak('Não entendi novamente.');
                            va_speak('Suas tentativas de preenchimento atingíram o limite.');
                        }
                    }
                    console.error('Erro no reconhecimento de fala: ' + event.error);
                };

                recognition.onresult = function(event) {

                    let is_password = false;

                    if (typeof(event.results) == 'undefined') {
                        recognition.onend = null;
                        recognition.stop();
                        return;
                    }

                    speak_tries = 0;

                    let transcript = event.results[0][0].transcript;

                    if(formCompleted){
                        if (transcript.toLowerCase().includes('sim enviar')){
                            form.submit();
                        }
                    }else{

                        if(field.getAttribute("type") == 'email'){
                            let email = va_emailField(transcript);
                            if (va_validEmail(email)){
                                field.value = email;
                            }else{
                                va_speak('Email inválido.');
                                fieldIndex -= 1;
                            }
                        }else if(field.getAttribute("type") == 'password'){
                            is_password = true;
                        }else if(field.getAttribute("type") == 'checkbox' && field.getAttribute("va_fill_field") == 'terms'){
                            console.log(transcript);
                            if (transcript.toLowerCase().includes('sim aceito')){
                                field.checked = true;
                            }else{
                                va_speak('É preciso aceitar os termos para prosseguir o preenchimento.');
                                fieldIndex -= 1;
                            }
                        }else{
                            field.value += transcript;
                        }

                        // Aguarde um pouco antes de prosseguir para o próximo campo
                        setTimeout(function() {
                            fillNextField(fieldIndex, is_password);
                        }, 1000);
                    }

                };

                function va_listen() {
                    va_audio.play();
                    recognition.start();
                }

                function va_speak(txt, listen = false, terms = false) {

                    if (terms) {
                        txt += ' Responda: Sim aceito ou Não aceito';
                    }else if (formCompleted){
                        txt += ' Responda: Sim enviar ou Não enviar';
                    }

                    const utterance = new SpeechSynthesisUtterance(txt);
                    window.speechSynthesis.speak(utterance);
                    recognition.stop();

                    utterance.onend = function() {
                        if (listen) {
                            va_listen();
                        }
                    };
                }

                function fillNextField(currentIndex) {

                    const FillableFields = form.querySelectorAll('input, textarea, select');

                    currentIndex++;
                    if (currentIndex < FillableFields.length) {
                        field = FillableFields[currentIndex];
                        const voicePrompt = field.getAttribute('voice');
                        const placeholderText = field.getAttribute('placeholder');
                        var txt;

                        if (voicePrompt) {
                            txt = voicePrompt;
                        } else if (placeholderText) {
                            txt = placeholderText;
                        }

                        fieldIndex = currentIndex
                        if (txt) {
                            if(field.getAttribute("type") == 'checkbox' && field.getAttribute("va_fill_field") == 'terms'){
                                va_speak(txt, true, true);
                            } if(field.getAttribute("type") == 'password'){
                                console.log('teste');
                                field.focus();
                                va_speak(txt += 'Ao finalizar, tecle TAB');

                                field.addEventListener("keydown", function(event) {

                                    if (event.keyCode === 9) {
                                      fillNextField(fieldIndex);
                                    }
                                });
                            }else{
                                va_speak(txt, true);
                            }

                        } else {
                            fillNextField(fieldIndex);
                        }

                    } else {
                        formCompleted = true;
                        va_speak("O preenchimento do formulário foi concluído.", true);
                    }
                }

                if (form) {

                    navigator.permissions.query({name: 'microphone'})
                    .then(function(permissionStatus) {
                        if (permissionStatus.state != 'granted') {
                            va_speak("Por favor, permita o uso do microfone para usar esta função.");
                        }
                    }).catch(function(error) {
                        console.log('Erro ao verificar permissão de microfone:', error);
                    });

                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

                        navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(function(stream) {
                            stream.getAudioTracks()[0].stop();

                            let va_form_description = form.getAttribute("va_form_description");

                            if (va_form_description) {
                                va_speak(va_form_description);
                            } else {
                                va_speak("Vamos iniciar o preenchimento do formulário.");
                            }

                            va_speak("Por favor, responda sempre após o som do bip.");

                            fillNextField(-1);
                        }).catch(function(err) {
                            va_speak("Você não permitiu o uso do microfone.");
                            console.error('Erro ao obter acesso ao microfone:', err);
                        });

                    } else {
                        console.error('A API getUserMedia não é suportada neste navegador');
                    }

                } else {
                    console.error(`Formulário com ID '${formId}' não encontrado.`);
                }
            });
        });
    } else {
        alert('Seu navegador não suporta a API de Síntese de Fala.');
    }
});
