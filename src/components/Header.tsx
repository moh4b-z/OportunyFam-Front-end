"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "@/service/config";
import NotificationsModal from "./modals/NotificationsModal";
import LogoutModal from "./modals/LogoutModal";
import JoinModal from "./modals/JoinModal";

interface HeaderProps {
  user?: {
    nome: string;
    foto_perfil?: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notificacoes`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao buscar notificações");
      const data = await response.json();
      setNotifications(data.notificacoes || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  return (
    <>
      <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm fixed top-0 left-0 z-50">
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/img/logo.png"
            alt="OportunyFam Logo"
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-xl font-semibold text-gray-800">OportunyFam</h1>
        </div>

        {/* BOTÕES */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setShowNotifications(true)}
            aria-label="Notificações"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full" />
            )}
          </button>

          {/* Usuário logado */}
          {user ? (
            <div className="relative flex items-center gap-2">
              <img
                src={
                  user.foto_perfil ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Perfil"
                className="w-9 h-9 rounded-full border border-gray-300 cursor-pointer"
                onClick={() => setShowLogout(true)}
              />
              <span className="text-gray-700 font-medium">
                {user.nome.split(" ")[0]}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* MODAIS */}
      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showLogout && (
        <LogoutModal onClose={() => setShowLogout(false)} />
      )}

      {showJoin && (
        <JoinModal onClose={() => setShowJoin(false)} />
      )}
    </>
  );
}
