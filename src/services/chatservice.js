import { Limiter } from "../utilities/limit";
import { validateMsg, validateUsername } from "../utilities/validator";
import { MsgHst } from "./msghistory";

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
    }

    Broadcast(data) {       //Metodo para transmitir mensajes a los clientes que se encuentran conectados
        this.wss.clients.array.forEach((client) => {
            if (client.readystate === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(data));
                } catch (error) {
                    console.error("Error al transmitir mensaje")
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
            TEXTO: validacion,
            USUARIO: ws.username,
            TIMESTAMP: new Date().toLocaleDateString()
        };

        this.mensajehistory.Add(datatransfer); //Para mandarlo a ti mismo
        this.Broadcast(datatransfer); //Mandarlo a todos los clientes
    }

    sendError(ws, error) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify({
                    type: 'error',
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

        ws.username = validacion;
        console.log(`Usuario logeado ${ws.username}`);

        if(this.mensajehistory.Count() > 0){      //TRAER EL HISTORIAL DE MENSAJES EN CASO DE SI EXISTAN MENSAJES
            ws.send(JSON.stringify({
                MENSAJE: this.mensajehistory.GetAll(),
                TYPE: history
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