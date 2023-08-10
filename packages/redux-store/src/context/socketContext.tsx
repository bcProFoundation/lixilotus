import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectWebSocket } from '@store/websocket/websocketUtils'; // Implement this function
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '@store/hooks';
import { connectToChannels } from '@store/websocket';

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const setupSocket = async () => {
      const newSocket = await connectWebSocket();
      setSocket(newSocket);
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      dispatch(connectToChannels());
    }
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
