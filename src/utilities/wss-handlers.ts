import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { connections, socketConnection } from "../wss";
import { WebSocket } from "ws";
import { redisSubscriber } from "../database/redis.config";
import db from "../database/database.config";
import { send } from "process";

export function generateSocketId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const handleWebSocketConnection = async (ws: WebSocket, request: IncomingMessage) => {
  const socketID = generateSocketId();
  let userID: string | null = null;

  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const token = url.searchParams.get("token");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      userID = decoded.id;

      const user = await db.user.findUnique({
        where: {
          id: userID,
        },
      });

      if (!user) {
        ws.send(
          JSON.stringify({
            type: "User doesnt exists",
            payload: { userID, socketID },
          })
        );

        return;
      }

      connections.set(userID, ws);

      socketConnection.set(ws, {
        userId: userID,
        socketId: socketID,
        channels: new Set<string>(),
      });

      ws.send(JSON.stringify({
          type: "Connection_successful",
          payload: { userID, socketID },
        }));

      const userChannel = `user:${userID}`;
      subscribeToChannel(ws, userChannel);

      console.log(`User ${userID} connected with socket ${socketID}`);
    } catch (error) {
      console.error("JWT verificaton failed.", error);

      ws.send(JSON.stringify({
          type: "error",
          payload: { message: "Authentication failed" },
     }));

      ws.close(1008, "Authentication failed");
    }
  } else {
    ws.send(JSON.stringify({
        type: "error",
        payload: { message: "Authentication failed" },
    })); 
  }
};



export const subscribeToChannel = async (ws: WebSocket, channel: string) => {
  const connectionInfo = socketConnection.get(ws);

  if (!connectionInfo) {
    return;
  }

  const subscribedConnection = Array.from(socketConnection.values()).filter(
    (connection) => connection.channels.has(channel)
  );

  if (subscribedConnection.length === 0) {
    await redisSubscriber.subscribe(channel);
  }

  connectionInfo.channels.add(channel);
  console.log(`Socket connection ${connectionInfo.socketId} is subscribed to channel ${channel}`);

  ws.send(JSON.stringify({
      type: `Channel_Joined`,
      payload: {
        channel
      }
  }));
};

export const unSubscribeToChannel = async(ws: WebSocket, channel:string) => {
    const connectionInfo = socketConnection.get(ws); 

    if(!connectionInfo)return; 
    connectionInfo.channels.delete(channel); 

    const subscribedConnection = Array.from(socketConnection.values()).filter(
        connection => connection.channels.has(channel)
    ); 

    if(subscribedConnection.length === 0){
        await redisSubscriber.unsubscribe(channel); 
    }

    console.log(`Socket connection ${connectionInfo.socketId} unsubscribted to channel ${channel}`);

    ws.send(JSON.stringify({
     type: 'channel_left',
     payload: { channel }
    })); 
}; 