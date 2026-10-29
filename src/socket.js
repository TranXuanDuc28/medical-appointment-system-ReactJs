import { io } from "socket.io-client";
const PATH = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
let socket;

export function getSocket() {
  if (!socket) {
    socket = io(PATH, { autoConnect: false });
  }
  return socket;
}
