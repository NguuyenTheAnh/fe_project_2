import { io } from 'socket.io-client';

// Khởi tạo connection với cấu hình tốt hơn
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: false
});

// Log connection events for debugging
socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
});

export default socket;
