"use client";

import React from "react";
import ModalOverlay from "../shared/ModalOverlay";

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
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-[400px] rounded-2xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Notificações
        </h2>

        {notifications.length > 0 ? (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="border-b border-gray-200 pb-2 text-sm text-gray-700"
              >
                <p>{n.message}</p>
                <span className="text-xs text-gray-400">{n.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            Nenhuma notificação disponível
          </p>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>
    </ModalOverlay>
  );
};

export default NotificationsModal;