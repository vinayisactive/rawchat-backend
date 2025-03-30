import { Server } from "socket.io";

const initializeSocketServer = (io: Server) => {

  io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} is connected.`);

    console.log(`Total connected clients: ${io.engine.clientsCount}`);

    socket.on("message", (data) => {
      console.log(`Message received from ${socket.id}:`, data);
      socket.broadcast.emit("message", data + `, total conn: ${io.engine.clientsCount}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} is disconnected.`);
    });
  });
};

export default initializeSocketServer;
