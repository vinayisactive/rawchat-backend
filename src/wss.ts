import { Server as HttpServer } from "http";
import {WebSocket, WebSocketServer} from 'ws'
import { handleWebSocketConnection } from "./utilities/wss-handlers";

export interface ConnectionInfo {
    userId: string;
    socketId: string;
    channels: Set<string>;
}; 

export const connections = new Map<string, WebSocket>(); 
export const socketConnection = new Map<WebSocket, ConnectionInfo>(); 

const initializeWebSocketServer = (httpServer: HttpServer) => {
     
    const wss = new WebSocketServer({server: httpServer}); 

    wss.on("connection", async(ws: WebSocket, request) => {
        await handleWebSocketConnection(ws, request)
    }); 
}

export default initializeWebSocketServer;
