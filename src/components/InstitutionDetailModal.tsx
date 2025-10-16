"use client";

import { useState, MouseEventHandler } from "react";

interface InstitutionDetailModalProps {
  onClose: MouseEventHandler<HTMLButtonElement>;
}

export default function InstitutionDetailModal({ onClose }: InstitutionDetailModalProps) {
  const logoUrl =
    "https://static.wixstatic.com/media/b12d01_3b32456f44844f15a92b1c56f9f0f57c~mv2.png";

  // Controle do modal de atividades
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showActivityList, setShowActivityList] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");

  const activities = ["Reforço Escolar", "Esportes", "Música"];

  const handleSelectActivity = (activity: string) => {
    setSelectedActivity(activity);
    setShowActivityList(false);
  };

  return (
    <>
      {/* Modal principal da Instituição */}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-40">
        <div className="bg-white p-6 rounded-2xl w-[600px] shadow-xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-orange-500"
          >
            ✕
          </button>

          <div className="flex items-center justify-center mb-4">
            <img src={logoUrl} alt="Logo Água Viva" className="w-24 h-24 object-contain" />
          </div>

          <h2 className="text-2xl font-semibold text-center mb-2 text-[#e76f51]">
            Instituição Água Viva
          </h2>
          <p className="text-gray-700 text-center mb-4">
            A Instituição Água Viva atua com projetos sociais voltados ao reforço escolar,
            alimentação e lazer de crianças e adolescentes em situação de vulnerabilidade.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setShowActivityModal(true)}
              className="bg-[#f4a261] hover:bg-[#e76f51] text-white font-semibold py-2 px-6 rounded-full transition"
            >
              Faça Parte
            </button>
          </div>
        </div>
      </div>

      {/* Modal secundário - Atividades */}
      {showActivityModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl relative">
            <button
              onClick={() => setShowActivityModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-orange-500"
            >
              ✕
            </button>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#e76f51]">Atividades Disponíveis</h3>
              <button
                onClick={() => setShowActivityList(!showActivityList)}
                className="text-[#f4a261] text-lg"
              >
                {showActivityList ? "▲" : "▼"}
              </button>
            </div>

            {showActivityList && (
              <ul className="border border-[#f4a261] rounded-lg p-2 space-y-2">
                {activities.map((activity) => (
                  <li
                    key={activity}
                    onClick={() => handleSelectActivity(activity)}
                    className={`p-2 rounded cursor-pointer text-center transition ${
                      selectedActivity === activity
                        ? "border-2 border-orange-500"
                        : "hover:bg-[#f4a261] hover:text-white"
                    }`}
                  >
                    {activity}
                  </li>
                ))}
              </ul>
            )}

            {selectedActivity && (
              <p className="text-green-600 text-center mt-4 font-medium">
                Atividade escolhida com sucesso!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
