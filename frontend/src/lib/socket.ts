import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

let socketToken: string | null = null;
let socket: Socket | null = null;

export const setSocketToken = (token: string | null): void => {
  socketToken = token;
};

function createSocket(): Socket {
  return io(SOCKET_URL, {
    withCredentials: true,
    auth: socketToken ? { token: socketToken } : {},
  });
}

export const getSocket = (): Socket => {
  if (!socket) {
    socket = createSocket();
  }
  return socket;
};

export const reconnectSocket = (): Socket => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketToken = null;
};

export const joinTicketRoom = (socket: Socket, ticketId: string): (() => void) => {
  const join = () => socket.emit("join_ticket", ticketId);
  if (socket.connected) {
    join();
  }
  socket.on("connect", join);
  return () => {
    socket.emit("leave_ticket", ticketId);
    socket.off("connect", join);
  };
};
