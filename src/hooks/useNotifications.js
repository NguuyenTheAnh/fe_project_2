import { useEffect, useState } from 'react';
import { notification } from 'antd';
import socket from '../util/socket';

export const useNotifications = (onRefreshTables) => {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // Function để reconnect thủ công
    const manualReconnect = () => {
        console.log('Manual reconnection initiated...');
        socket.disconnect();
        setTimeout(() => {
            socket.connect();
            notification.info({
                message: 'Reconnecting...',
                description: 'Attempting to reconnect to real-time notifications',
                placement: 'topRight',
                duration: 2,
            });
        }, 500);
    };

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

        // 🆕 Lắng nghe sự kiện khách hàng đăng nhập và chiếm bàn
        socket.on('guest-login', (notificationData) => {
            console.log('Guest login notification:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            const guestName = notificationData.data?.guest_name || 'Khách hàng';
            const tableName = notificationData.data?.table_name || 'bàn';

            notification.info({
                message: '🔵 Khách hàng đăng nhập',
                description: notificationData.message || `${guestName} đã ngồi vào ${tableName}`,
                placement: 'topRight',
                duration: 4,
                style: {
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                }
            });

            // Phát âm thanh thông báo nhẹ
            playNotificationSoundLight();

            // Refresh tables list
            if (onRefreshTables && typeof onRefreshTables === 'function') {
                setTimeout(() => {
                    onRefreshTables();
                }, 500);
            }
        });

        // 🆕 Lắng nghe sự kiện bàn được sử dụng
        socket.on('table-occupied', (notificationData) => {
            console.log('Table occupied notification:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            const guestName = notificationData.data?.guest_name || 'Khách hàng';
            const tableName = notificationData.data?.table_name || 'bàn';

            notification.warning({
                message: '🟡 Bàn được sử dụng',
                description: notificationData.message || `${tableName} đã được ${guestName} sử dụng`,
                placement: 'topRight',
                duration: 4,
                style: {
                    background: '#fff7e6',
                    border: '1px solid #ffd591',
                }
            });

            // Phát âm thanh thông báo cho table occupied
            playTableOccupiedSound();

            // Refresh tables list
            if (onRefreshTables && typeof onRefreshTables === 'function') {
                setTimeout(() => {
                    onRefreshTables();
                }, 500);
            }
        });

        // 🆕 Lắng nghe sự kiện khách hàng checkout và rời bàn
        socket.on('guest-checkout', (notificationData) => {
            console.log('Guest checkout notification:', notificationData);
            setNotifications(prev => [notificationData, ...prev]);

            const guestName = notificationData.data?.guest_name || 'Khách hàng';
            const tableName = notificationData.data?.table_name || 'bàn';

            notification.info({
                message: '🟠 Khách hàng rời bàn',
                description: notificationData.message || `${guestName} đã rời ${tableName}`,
                placement: 'topRight',
                duration: 4,
                style: {
                    background: '#fff7e6',
                    border: '1px solid #ffd591',
                }
            });

            // Phát âm thanh thông báo nhẹ
            playNotificationSoundLight();

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
            socket.off('guest-login');
            socket.off('table-occupied');
            socket.off('guest-checkout');
            socket.off('order-status-update');
            socket.off('notification');
        };
    }, [onRefreshTables]);

    const playNotificationSound = () => {
        try {
            // Tạo âm thanh thông báo mạnh cho thanh toán
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

    const playNotificationSoundLight = () => {
        try {
            // Tạo âm thanh thông báo nhẹ cho guest login/checkout
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Âm lượng nhẹ hơn
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2); // Thời gian ngắn hơn
        } catch (error) {
            console.log('Cannot play light notification sound:', error);
        }
    };

    const playTableOccupiedSound = () => {
        try {
            // Tạo âm thanh thông báo cho table occupied (trung bình)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(650, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.15);

            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // Âm lượng trung bình
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch (error) {
            console.log('Cannot play table occupied sound:', error);
        }
    };

    return {
        notifications,
        isConnected,
        socket,
        manualReconnect
    };
};
