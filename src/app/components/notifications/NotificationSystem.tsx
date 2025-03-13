import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { db } from "../../utils/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "../../core/context/AuthContext";

// Bildirim tip tanımı
interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Timestamp;
  userId: string;
}

// Button bileşeni
interface ButtonProps {
  children: React.ReactNode;
  color: string;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, color, className = "", onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md ${color === "primary" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"} ${className}`}
  >
    {children}
  </button>
);

// Ana bileşen
export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  // Bildirimleri yükle
  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;

    const notificationRef = collection(db, "notifications");
    const notificationDoc = doc(notificationRef, notificationId);
    await updateDoc(notificationDoc, { read: true });
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;

    const unreadNotifications = notifications.filter((n) => !n.read);
    const batch = writeBatch(db);

    unreadNotifications.forEach((notification) => {
      const notificationRef = doc(db, "notifications", notification.id);
      batch.update(notificationRef, { read: true });
    });

    await batch.commit();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        color="light"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center bg-red-600 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <Button
                  color="light"
                  className="text-xs py-1 px-2"
                  onClick={markAllAsRead}
                >
                  Tümünü Okundu İşaretle
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Bildirim bulunmuyor
                </p>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.link || "#"}
                    className={`block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(
                        notification.createdAt.toDate()
                      ).toLocaleDateString("tr-TR")}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export ekleyerek hem named hem de default export olması sağlanıyor
export default NotificationSystem;