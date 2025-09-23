"use client";

import { useState } from "react";
import { Search, User, MapPin, MessageSquare, GraduationCap } from "lucide-react";

// Componente da página inicial (Página do Responsável)
function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="font-sans bg-gray-100 min-h-screen p-4 md:p-8 lg:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome */}
        <div className="card bg-white p-6 rounded-2xl shadow-md border border-gray-200 col-span-1 md:col-span-2 lg:col-span-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Olá! Bem-vindo ao seu espaço educativo!</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Aqui você pode acessar suas informações, descobrir novas instituições e acompanhar
            seu progresso educacional.
          </p>
        </div>

        {/* Quick Access */}
        <div className="card bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Acessos Rápidos</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg text-purple-600 transition-colors hover:bg-purple-100 cursor-pointer">
              <Search className="h-5 w-5" />
              <span>Encontre novos cursos</span>
            </div>
            <div
              className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg text-purple-600 transition-colors hover:bg-purple-100 cursor-pointer"
              onClick={() => onNavigate('filho')}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Ir para a página do filho</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="card bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <User className="h-6 w-6" />
            <h2 className="text-lg font-semibold text-gray-800">Minhas Informações</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-900 text-lg">Ana Clara</h3>
              <p className="text-sm text-gray-500">10 anos</p>
              <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold self-start mt-1">Estudante</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>São Paulo, SP</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GraduationCap className="h-4 w-4" />
              <span>Nascida em 15/03/2015</span>
            </div>
          </div>
        </div>

        {/* Institutions */}
        <div className="card bg-white p-6 rounded-2xl shadow-md border border-gray-200 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lista de Instituições que você faz parte</h2>
          <div className="space-y-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">Mazza Escola</div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">Cursos ISR</div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">Karate Kids</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente da página do filho (FilhoPage)
function FilhoPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="font-sans bg-gray-100 min-h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Home do Filho</h1>
        <p className="text-gray-600 mb-6">Essa é a tela dedicada ao filho.</p>

        {/* Botão para voltar à Home do Responsável */}
        <button
          className="bg-purple-600 text-white rounded-full px-6 py-3 font-semibold hover:bg-purple-700 transition-colors"
          onClick={() => onNavigate('home')}
        >
          Voltar para Home do Responsável
        </button>
      </div>
    </div>
  );
}

// Componente principal que gerencia as páginas
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  switch (currentPage) {
    case 'home':
      return <Home onNavigate={handleNavigate} />;
    case 'filho':
      return <FilhoPage onNavigate={handleNavigate} />;
    default:
      return <Home onNavigate={handleNavigate} />;
  }
}
