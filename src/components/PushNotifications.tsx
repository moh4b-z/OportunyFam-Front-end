"use client";

import React, { useState, useEffect } from "react";
import styles from "../app/styles/Notification.module.css";

interface PushNotification {
  id: number;
  name: string;
  message: string;
  time: string;
  isLate?: boolean;
}

interface PushNotificationsProps {
  notifications?: PushNotification[];
  autoShow?: boolean;
  showDelay?: number;
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  notifications = [],
  autoShow = true,
  showDelay = 2000,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<PushNotification[]>([]);

  useEffect(() => {
    if (autoShow && notifications.length > 0) {
      const timer = setTimeout(() => {
        // Mostra as notificações uma por uma com um pequeno delay
        notifications.forEach((notification, index) => {
          setTimeout(() => {
            setVisibleNotifications(prev => [...prev, notification]);
            
            // Auto remove após 5 segundos
            setTimeout(() => {
              removeNotification(notification.id);
            }, 5000);
          }, index * 500); // 500ms de delay entre cada notificação
        });
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [notifications, autoShow, showDelay]);

  const removeNotification = (id: number) => {
    setVisibleNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification: PushNotification) => {
    // Aqui você pode adicionar lógica para quando a notificação é clicada
    console.log("Notificação clicada:", notification);
    removeNotification(notification.id);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.pushNotificationsContainer}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.pushNotification} ${styles.visible}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <button
            className={styles.pushNotificationClose}
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ✕
          </button>
          
          <div className={styles.pushNotificationContent}>
            <div className={styles.pushNotificationHeader}>
              <div className={styles.pushNotificationDot}></div>
              <div className={styles.pushNotificationName}>
                {notification.name}
              </div>
              <div className={`${styles.pushNotificationTime} ${notification.isLate ? styles.late : ''}`}>
                {notification.time}
              </div>
            </div>
            <div className={styles.pushNotificationMessage}>
              {notification.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PushNotifications;
