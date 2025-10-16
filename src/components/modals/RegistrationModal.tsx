"use client";

import React, { useState } from "react";
import ModalOverlay from "../shared/ModalOverlay";
import InputGroup from "../shared/InputGroup";
import Dropdown from "../shared/Dropdown";
import { BASE_URL } from "@/service/config";

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type RegistrationForm = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  pais: string;
  sexo: string;
};

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<RegistrationForm>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    pais: "",
    sexo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.senha !== formData.confirmarSenha) {
        throw new Error("As senhas não coincidem.");
      }

      const response = await fetch(`${BASE_URL}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          pais: formData.pais,
          sexo: formData.sexo,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro no cadastro: ${text || response.statusText}`);
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.message || "Erro inesperado no cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-[380px] rounded-2xl p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Criar Conta
        </h2>

        <form onSubmit={handleSubmit}>
          <InputGroup
            label="Nome completo"
            name="nome"
            value={formData.nome}
            placeholder="Digite seu nome"
            onChange={handleChange}
          />

          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            placeholder="Digite seu email"
            onChange={handleChange}
          />

          <InputGroup
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            placeholder="Crie uma senha"
            onChange={handleChange}
          />

          <InputGroup
            label="Confirmar Senha"
            name="confirmarSenha"
            type="password"
            value={formData.confirmarSenha}
            placeholder="Confirme sua senha"
            onChange={handleChange}
          />

          <Dropdown
            label="País"
            name="pais"
            value={formData.pais}
            options={[
              { value: "br", label: "Brasil" },
              { value: "us", label: "Estados Unidos" },
              { value: "pt", label: "Portugal" },
            ]}
            placeholder="Selecione seu país"
            onChange={handleChange}
          />

          <Dropdown
            label="Sexo"
            name="sexo"
            value={formData.sexo}
            options={[
              { value: "1", label: "Feminino" },
              { value: "2", label: "Masculino" },
              { value: "3", label: "Outro" },
            ]}
            placeholder="Selecione seu sexo"
            onChange={handleChange}
          />

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm mt-2 text-center">
              Cadastro realizado com sucesso!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-70"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
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

export default RegistrationModal;