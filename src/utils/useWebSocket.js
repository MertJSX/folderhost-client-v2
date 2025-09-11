import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useWebSocket = (path) => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnectedRef = useRef(false)
  const [messages, setMessages] = useState([]);
  // const messages = useRef([])
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    const token = Cookies.get("token");
    if (!token) {
      console.error('Token not found');
      return;
    }

    const wsUrl = `${API_BASE_URL}/ws/${encodeURIComponent(path)}?token=${encodeURIComponent(token)}`;
    //const wsUrl = "ws://localhost:5000/ws/%2F?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTc1MzM0NzgsInVzZXJuYW1lIjoiYWRtaW4ifQ.xHjvdPSgFJRZs8GUmZ2svHkbBxgRGDsZqlDX4UHjZcw"

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket has been connected!');
      setIsConnected(true);
      isConnectedRef.current = true;
      wsRef.current = websocket;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onmessage = (event) => {
      console.log('Message:', event.data);
      setMessages(prev => [...prev, event.data]);
    };

    websocket.onclose = (event) => {
      console.error(event);

      console.log('WebSocket connection has been closed', event.code, event.reason);
      setIsConnected(false);
      isConnectedRef.current = false;
      // setWs(null);
      wsRef.current = null;

      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Trying to connect again...');
          connect();
        }, 5000);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [path]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn("WebSocket not ready, cannot send:", message);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnectedRef,
    messages,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;