// Creando el arranque del servidor con express
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
const app = express();
const servidor = http.createServer(app);

//Crear el puerto de canal de comunicacion
const wss = new WebSocketServer({servidor});