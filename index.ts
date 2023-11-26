import { FillOptions } from "./interfaces/fillOptions"
import Recognizer from "./src/recognizer"

export const fillForm = (form: HTMLElement,options:FillOptions = {}) => {
    var recognizer:Recognizer = new Recognizer(options)
    
}