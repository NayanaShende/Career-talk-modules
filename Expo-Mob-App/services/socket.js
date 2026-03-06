import { io } from "socket.io-client";

const socket = io("http://10.89.141.9:3000/api", {
  transports: ["websocket"],
});

export default socket;
