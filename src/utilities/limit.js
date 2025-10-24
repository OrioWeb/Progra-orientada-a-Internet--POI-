import { config } from "../config/constantes.js";

export class Limiter{
    constructor(){ //corroborar que el usuario no este spameando
        this.users = new Map(); //el map guardara el nombre del usuario y la hora de envio
    }

    Checklimit(username){ //Verificar de un usuario que nos llegue si este puede mandar mensajes
        const now = Date.now();
        const usermsgs = this.users.get(username)||[];
        //filtro de mensajes recientes
        const recentmsgs = usermsgs.filter(
            timestamp => now-timestamp<config.RATELIMIT.WAITINGROOMms //Comprobar que al momento de mandar un nuevo mensaje no se haya excedido el limite de mensajes por segundo
        )
        if(recentmsgs.length>=config.RATELIMIT.MAXMSGS){ //Comprobar que no se haya excedido
            const oldestmsg = recentmsgs[0];
            const waittime = Math.ceil((config.RATELIMIT.WAITINGROOMms - (now - oldestmsg)) / 1000); //Corroborar que ya pasó el tiempo castigado
            
            return {allowed: false, error: `Estás mandando muchos mensajes. Espera ${waittime} segundos`};
        }

        recentmsgs.push(now);
        this.users.set(username, recentmsgs);
        return {allowed: true};
        
    }

}