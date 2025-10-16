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
      <div className="bg-white w-[380px] rounded-2xl p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Entrar
        </h2>

        <form>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Digite seu email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Senha</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Entrar
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>
    </ModalOverlay>
  );
};

export default JoinModal;