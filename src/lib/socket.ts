import { io, Socket } from "socket.io-client";

export interface ServerToClientEvents {
  changed: (data: { taskId: number }) => void;
  message: (data: { id: string; text: string; sender: string }) => void;
}
export interface ClientToServerEvents {
  message: (text: string) => void;
  joinRoom: (room: string) => void;
}

const socketUrl =  import.meta.env.VITE_BACKEND_URL;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  socketUrl,
  {
    autoConnect: false,
    withCredentials: true,
  }
);