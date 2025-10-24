// Creando el arranque del servidor con express
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { chatservice } from "./src/services/chatservice.js";
import { config } from "./src/config/constantes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);

//Crear el port de canal de comunicacion
const wss = new WebSocketServer({server});
app.use(express.static(path.join(__dirname, 'public')));

const chat = new chatservice(wss);
wss.on("connection", (ws)=>{
    chat.ManejarConexion(ws);
})

wss.on("error", (error)=>{
    console.error("Error del server:", error);
})

const port = config.PORT;
server.listen(port, ()=>{
    console.log(`Servidor escuchando en el port ${port}`);
})