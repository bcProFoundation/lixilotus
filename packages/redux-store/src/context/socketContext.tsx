import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { connectWebSocket } from '@store/websocket/websocketUtils'; // Implement this function
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { connectToChannels } from '@store/websocket';
import { getSelectedAccount } from '@store/account';
import { userSubcribeToAddressChannel, userSubcribeToMultiPageMessageSession } from '@store/message/actions';
import usePrevious from '@hooks/usePrevious';

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const previousSelectedAccount = usePrevious(selectedAccount);

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

  useEffect(() => {
    if (socket && selectedAccount) {
      dispatch(userSubcribeToMultiPageMessageSession(selectedAccount.id));
      dispatch(userSubcribeToAddressChannel(selectedAccount.address));
    }
  }, [socket, selectedAccount]);

  useEffect(() => {
    //if change account, disconnect socket and reconnect
    if (previousSelectedAccount && selectedAccount !== previousSelectedAccount) {
      if (socket) socket.disconnect();

      const setupSocket = async () => {
        const newSocket = await connectWebSocket();
        setSocket(newSocket);
      };

      setupSocket();
    }
  }, [selectedAccount]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
