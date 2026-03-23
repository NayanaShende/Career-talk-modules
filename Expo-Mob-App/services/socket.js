import { io } from "socket.io-client";

const socket = io("http://192.168.1.16:3000/api", {
  transports: ["websocket"],
});

export default socket;
