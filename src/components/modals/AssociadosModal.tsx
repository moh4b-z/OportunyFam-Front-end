"use client";

import React from "react";
import ModalOverlay from "../shared/ModalOverlay";

type Associado = {
  id: number;
  nome: string;
  email?: string;
  cargo?: string;
};

type AssociadosModalProps = {
  isOpen: boolean;
  onClose: () => void;
  associados?: Associado[];
};

const AssociadosModal: React.FC<AssociadosModalProps> = ({
  isOpen,
  onClose,
  associados = [],
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-[420px] max-h-[500px] rounded-2xl p-6 shadow-lg relative flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Associados
        </h2>

        {associados.length > 0 ? (
          <ul className="space-y-3 overflow-y-auto flex-1">
            {associados.map((assoc) => (
              <li
                key={assoc.id}
                className="border-b border-gray-200 pb-2 text-sm text-gray-700 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{assoc.nome}</p>
                  {assoc.cargo && (
                    <p className="text-xs text-gray-500">{assoc.cargo}</p>
                  )}
                  {assoc.email && (
                    <p className="text-xs text-gray-400">{assoc.email}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">
            Nenhum associado encontrado
          </p>
        )}

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

export default AssociadosModal;