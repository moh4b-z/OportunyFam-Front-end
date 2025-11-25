"use client";

import React, { useEffect, useRef } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  // Fechar ao clicar fora usando listener global (overlay continua não-bloqueante)
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const card = cardRef.current;
      if (card && !card.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [onClose]);

  return (
    <div className={styles.notificationModalLateral}>
      <div
        ref={cardRef}
        className={styles.notificationModalContentLateral}
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