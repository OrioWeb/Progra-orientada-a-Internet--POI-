import { config } from "../config/constantes.js";

export function validateUsername(username){
    if(!username){
        return {valid: false, error: "Es necesario un nombre de usuario"};
    }
    const trim = username.trim();
    if(trim.length === 0){
        return {valid: false, error: "El nombre de usuario no puede estar vacio"};
    }
    if(trim.length > config.MAXLENGTHUSER){
        return {valid: false, error: "Nombre de usuario excede el limite de caracteres"};
    }
    return {valid: true};
}

export function validateMsg(mensaje){
if(!mensaje){
        return {valid: false, error: "No se ha enviado mensaje"};
    }
    const trim = mensaje.trim();
    if(trim.length === 0){
        return {valid: false, error: "El mensaje no puede estar vacio"};
    }
    if(trim.length > config.MAXLENGTHMSG){
        return {valid: false, error: "El mensaje excede el limite de caracteres"};
    }
    return {valid: true};
}
