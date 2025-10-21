"use client";

import React from "react";
import styles from "../../app/styles/Notification.module.css";

type NotificationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications?: { id: number; message: string; date: string }[];
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
}) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackgroundClick}
      className={styles.notificationModalLateral}
    >
      <div
        className={styles.notificationModalContentLateral}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.notificationModalTitle}>
          Notificação
        </h2>

        <button
          onClick={onClose}
          className={styles.notificationModalClose}
        >
          ✕
        </button>

        {notifications.length > 0 ? (
          <ul className={styles.notificationsList}>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={styles.notificationItem}
              >
                <div className={styles.notificationDot}></div>
                <div className={styles.notificationContent}>
                  <p className={styles.notificationMessage}>{n.message}</p>
                  <span className={styles.notificationDate}>{n.date}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyNotifications}>
            Nenhuma notificação disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;