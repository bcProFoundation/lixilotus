import { io, Socket } from 'socket.io-client';

const baseUrl = process.env.NEXT_PUBLIC_LIXI_API ? process.env.NEXT_PUBLIC_LIXI_API : 'https://lixilotus.com/';
const socketServerUrl = `${baseUrl}ws/notifications`;

export const connectWebSocket = (): Promise<Socket> => {
  return new Promise<Socket>((resolve, reject) => {
    let socket: Socket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000;

    const setupSocket = () => {
      socket = io(socketServerUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        resolve(socket);
      });

      socket.on('connect_error', error => {
        console.error('WebSocket connection error:', error);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log('Attempting to reconnect...');
          setTimeout(setupSocket, reconnectDelay);
        } else {
          console.log('WebSocket connection failed after maximum reconnect attempts.');
          reject(error);
        }
      });

      socket.on('error', error => {
        console.error('WebSocket error:', error);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        /* I dont know if we need to reconnect here?? */

        // if (reconnectAttempts < maxReconnectAttempts) {
        //   reconnectAttempts++;
        //   console.log('Attempting to reconnect...');
        //   setTimeout(setupSocket, reconnectDelay);
        // } else {
        //   console.log('WebSocket connection failed after maximum reconnect attempts.');
        //   reject('WebSocket connection failed after maximum reconnect attempts.');
        // }
      });
    };

    setupSocket();
  });
};
