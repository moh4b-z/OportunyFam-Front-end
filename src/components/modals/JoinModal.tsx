"use client";

import React from "react";
import ModalOverlay from "../shared/ModalOverlay";

type JoinModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 w-[380px] rounded-2xl p-6 shadow-lg relative transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center transition-colors duration-200">
          Entrar
        </h2>

        <form>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-200">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 dark:focus:ring-orange-400 transition-colors duration-200"
              placeholder="Digite seu email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-200">Senha</label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 dark:focus:ring-orange-400 transition-colors duration-200"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
          >
            Entrar
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </ModalOverlay>
  );
};

export default JoinModal;