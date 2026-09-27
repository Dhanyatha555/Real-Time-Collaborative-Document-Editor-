import { io } from "socket.io-client";
import { API_URL } from "./api.js";

// one connection per open document; the JWT is sent while connecting
export function createSocket(token) {
  return io(API_URL, { auth: { token } });
}
