import { Limiter } from "../utilities/limit.js";
import { validateMsg, validateUsername } from "../utilities/validator.js";
import { MsgHst } from "./msghistory.js";

export class chatservice {
    constructor(wss) {
        this.wss = wss;
        this.mensajehistory = new MsgHst();
        this.limit = new Limiter();
    }

    //Hacer un metodo que maneje la conexion al websocket
    ManejarConexion(ws) {
        console.log("Cliente conectado");
        ws.isactive = true;
        ws.username = null;
        ws.on("pong",()=>{
            ws.isactive = true;
        })
        ws.on("message",(mensaje)=>{
            this.ManejarMensaje(mensaje, ws)
        })
        ws.on("error",(error)=>{
            console.log(`Error del websocket ${error}`);
        })
        ws.on("close",()=>{
            console.log(`Cliente desconectado ${ws.username}`);
        })
    }

    Broadcast(data) {       //Metodo para transmitir mensajes a los clientes que se encuentran conectados
        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) { // 1 = OPEN
                try {
                    client.send(JSON.stringify(data));
                } catch (error) {
                    console.error("Error al transmitir mensaje:", error)
                }
            }
        });
    }

    ManejarMensajeChat(ws, data) {
        if (!ws.username) {
            this.sendError(ws, "No se detecto ningun usuario");
            return;
        }
        
        const validacion = validateMsg(data.text);
        if(!validacion.valid){
            this.sendError(ws, validacion.error);
            return;
        }

        const limitcheck = this.limit.Checklimit(ws.username);
        if(!limitcheck.allowed){
            this.sendError(ws, limitcheck.error);
            return;
        }

        const datatransfer = {
            text: validacion.cleaned,
            username: ws.username,
            timestamp: new Date().toLocaleTimeString()
        };

        this.mensajehistory.Add(datatransfer); //Para mandarlo a ti mismo
        this.Broadcast(datatransfer); //Mandarlo a todos los clientes
    }

    sendError(ws, error) {
        if (ws.readyState === 1) { // 1 = OPEN
            try {
                ws.send(JSON.stringify({
                    TYPE: 'error',
                    error: error
                }));
            } catch (e) {
                console.error('Error sending error message:', e);
            }
        }
    }

// FUNCION TEMPORAL EN LO QUE CAE EL BACKEND
    ManejarLogin(ws,data){
        const validacion = validateUsername(data.username);
        if(!validacion.valid){
            this.sendError(ws, validacion.error);
            return;
        }

        ws.username = validacion.cleaned;
        console.log(`Usuario logeado ${ws.username}`);

        if(this.mensajehistory.Count() > 0){      //TRAER EL HISTORIAL DE MENSAJES EN CASO DE SI EXISTAN MENSAJES
            ws.send(JSON.stringify({
                messages: this.mensajehistory.GetAll(),
                TYPE: 'mensaje'
            }));
        }
    }

    ManejarMensaje(mensaje, ws) {
        try {
            const data = JSON.parse(mensaje);
            if(data.TYPE === "login"){
                this.ManejarLogin(ws, data);
            }else if(data.TYPE === "mensaje"){
                this.ManejarMensajeChat(ws, data);
            }
        } catch (error) {
            this.sendError(ws, "Error procesando mensaje");
        }
    }
}