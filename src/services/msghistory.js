import { config } from "../config/constantes.js";

//Almacenamiento "local" de los mensajes enviados (aun no hay db)
export class MsgHst{
    constructor(){
        this.messages = []; //Cuando se cree el historial de mensajes todo se guardara de forma local en un arreglo
    }

    Add(mensaje){
        this.messages.push(mensaje);
        if(this.messages.length>config.LIMITHISTORY){  //Al momento de agregar un nuevo mensaje le dara prioridad al largo del arreglo
            this.messages.shift();                     //Se van quitando los elementos mas viejos AKA los de hasta arriba cuando se supere el limite
        }
    }

    GetAll(){
        return this.messages;
    }

    Count(){
        return this.messages.length;
    }


}

