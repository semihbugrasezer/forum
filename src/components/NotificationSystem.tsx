import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Badge, Dropdown } from 'flowbite-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // TODO: Fetch notifications from Supabase
    const fetchNotifications = async () => {
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New User Registration',
          message: 'A new user has registered on the forum.',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Post Reported',
          message: 'A post has been reported for inappropriate content.',
          type: 'warning',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // TODO: Mark notification as read in Supabase
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Dropdown
      label={
        <div className="relative">
          <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge
              color="red"
              className="absolute -top-2 -right-2 rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      }
      arrowIcon={false}
      inline
      dismissOnClick={false}
    >
      <div className="w-80">
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          Notifications
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  !notification.read ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <Badge
                    color={getNotificationColor(notification.type)}
                    className="mr-2"
                  >
                    {notification.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
                // TODO: Mark all notifications as read
                setNotifications(
                  notifications.map((n) => ({ ...n, read: true }))
                );
                setUnreadCount(0);
              }}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </Dropdown>
  );
} 