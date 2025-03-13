import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import {
  subscribeToNotifications,
  markNotificationAsRead,
} from "./NotificationService";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(
      currentUser.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    // Bildirime özgü yönlendirme
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Bildirimler</h2>
      </div>
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              !notification.read ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === "comment" && (
                  <svg
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(
                    notification.createdAt?.toDate()
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Henüz bildiriminiz yok
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
