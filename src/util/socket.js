// src/socket.js

import { io } from 'socket.io-client';

// Xác định URL của server backend một cách chính xác
// - Trong production (khi chạy trên VPS), nó là URL của chính trang web.
// - Trong development (khi chạy ở máy bạn), nó là địa chỉ server NestJS.
const SERVER_URL = import.meta.env.PROD
    ? import.meta.env.VITE_FRONTEND_URL  // Biến này sẽ là http://146.190.99.228
    : 'http://localhost:8000';

// Log ra để kiểm tra xem URL có đúng không
console.log(`Attempting to connect Socket.IO to: ${SERVER_URL}`);

const socket = io(SERVER_URL, {
    // Tự động kết nối khi khởi tạo
    autoConnect: true,
    // Ưu tiên dùng WebSocket, nếu không được sẽ tự chuyển sang polling
    transports: ['websocket', 'polling'],
});

// Các listener để debug (giữ nguyên)
socket.on('connect', () => {
    console.log('Socket connected successfully with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
    // Log chi tiết lỗi để dễ dàng debug
    console.error('Socket connection error:', error.message);
});

export default socket;