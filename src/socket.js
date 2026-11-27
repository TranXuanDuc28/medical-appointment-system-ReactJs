import { io } from "socket.io-client";
const PATH = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
let socket;

export function getSocket() {
  if (!socket) {
    // withCredentials: gửi cookie httpOnly `jwt` khi handshake để server xác thực socket
    socket = io(PATH, { autoConnect: false, withCredentials: true });
  }
  return socket;
}
