// src/socket.js
import { io } from "socket.io-client";

// Replace with your backend URL
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // optional but helps avoid long polling delays
});

export default socket;
