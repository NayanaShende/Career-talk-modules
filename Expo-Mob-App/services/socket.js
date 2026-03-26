import { io } from "socket.io-client";

const socket = io("http://172.20.10.3:3000/api", {
  transports: ["websocket"],
});

export default socket;
