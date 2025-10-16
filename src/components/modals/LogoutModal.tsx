"use client";

import React from "react";
import ModalOverlay from "../shared/ModalOverlay";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-[320px] rounded-2xl p-6 shadow-lg relative text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Deseja sair?
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          Você será desconectado da sua conta.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Sair
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>

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

export default LogoutModal;