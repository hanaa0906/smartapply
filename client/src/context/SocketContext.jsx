import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    // Connect to backend Socket.IO
    const newSocket = io(window.location.origin, {
      path: '/socket.io',
      auth: { token: localStorage.getItem('smartapply_token') },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      // console.log('[Socket] Connected to server with ID:', newSocket.id);
      setConnected(true);

    });

    newSocket.on('disconnect', () => {
      // console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  const joinApplication = (applicationId) => {
    if (socket && applicationId) {
      socket.emit('join_application', applicationId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinApplication }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
