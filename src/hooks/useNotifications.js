import { useEffect, useState } from 'react';
import { notification } from 'antd';
import socket from '../util/socket';

export const useNotifications = (onRefreshTables) => {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // Kiểm tra trạng thái kết nối hiện tại
        setIsConnected(socket.connected);

        // Nếu chưa kết nối, thử kết nối lại
        if (!socket.connected) {
            console.log('Socket not connected, attempting to connect...');
            socket.connect();
        }

        // Kết nối events
        const handleConnect = () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log('Disconnected from WebSocket server:', reason);
            setIsConnected(false);
        };

        const handleConnectError = (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        };

        const handleReconnect = (attemptNumber) => {
            console.log('Reconnected to WebSocket server, attempt:', attemptNumber);
            setIsConnected(true);
        };

        const handleReconnectError = (error) => {
            console.error('Reconnection error:', error);
            setIsConnected(false);
        };

        // Đăng ký event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('reconnect', handleReconnect);
        socket.on('reconnect_error', handleReconnectError);

        // Lắng nghe thông báo thanh toán thành công
        socket.on('payment-success', (notificationData) => {
            console.log('Payment success notification:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            // Hiển thị notification success
            notification.success({
                message: 'Payment Success!',
                description: notificationData.message || `Payment completed successfully at ${notificationData.data?.table_name}`,
                placement: 'topRight',
                duration: 5,
            });

            // Phát âm thanh thông báo
            playNotificationSound();

            // Refresh tables list
            if (onRefreshTables && typeof onRefreshTables === 'function') {
                setTimeout(() => {
                    onRefreshTables();
                }, 500); // Delay một chút để đảm bảo backend đã cập nhật
            }
        });

        // Lắng nghe cập nhật trạng thái bàn
        socket.on('table-status-update', (notificationData) => {
            console.log('Table status update:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            notification.info({
                message: 'Table Status Updated',
                description: notificationData.message || `Table status has been updated`,
                placement: 'topRight',
                duration: 3,
            });

            // Refresh tables list
            if (onRefreshTables && typeof onRefreshTables === 'function') {
                setTimeout(() => {
                    onRefreshTables();
                }, 500);
            }
        });

        // Lắng nghe cập nhật trạng thái đơn hàng
        socket.on('order-status-update', (notificationData) => {
            console.log('Order status update:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            notification.info({
                message: 'Order Status Updated',
                description: notificationData.message || `Order status has been updated`,
                placement: 'topRight',
                duration: 3,
            });

            // Refresh tables list
            if (onRefreshTables && typeof onRefreshTables === 'function') {
                setTimeout(() => {
                    onRefreshTables();
                }, 500);
            }
        });

        // Lắng nghe thông báo chung
        socket.on('notification', (notificationData) => {
            console.log('General notification:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            notification.info({
                message: 'Notification',
                description: notificationData.message || 'New notification received',
                placement: 'topRight',
                duration: 4,
            });
        });

        // Cleanup khi component unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('reconnect', handleReconnect);
            socket.off('reconnect_error', handleReconnectError);
            socket.off('payment-success');
            socket.off('table-status-update');
            socket.off('order-status-update');
            socket.off('notification');
        };
    }, [onRefreshTables]);

    const playNotificationSound = () => {
        try {
            // Tạo âm thanh thông báo đơn giản
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Cannot play notification sound:', error);
        }
    };

    return {
        notifications,
        isConnected,
        socket
    };
};
