"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/styles/AddChildModal.module.css";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onChildAdded?: () => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  userId,
  onChildAdded,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    foto_perfil: "",
    email: "",
    cpf: "",
    senha: "",
    data_nascimento: "",
    id_sexo: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [selectedInstituicao, setSelectedInstituicao] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("https://oportunyfam-back-end.onrender.com/v1/oportunyfam/instituicoes")
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro na requisição');
          }
          return response.json();
        })
        .then(data => {
          console.log('Dados recebidos:', data);
          if (data && data.dados && Array.isArray(data.dados)) {
            setInstituicoes(data.dados);
          } else if (Array.isArray(data)) {
            setInstituicoes(data);
          } else {
            console.error('Formato de dados inesperado:', data);
            setInstituicoes([]);
          }
        })
        .catch(error => {
          console.error("Erro ao carregar instituições:", error);
          setInstituicoes([]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Cadastrar a criança
      const response = await fetch("https://oportunyfam-back-end.onrender.com/v1/oportunyfam/criancas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id_usuario: userId || 1,
        }),
      });

      if (response.ok) {
        const childData = await response.json();
        let childId = null;
        
        // Extrair ID da criança criada
        if (childData && childData.dados && childData.dados.id) {
          childId = childData.dados.id;
        } else if (childData && childData.id) {
          childId = childData.id;
        }

        // 2. Se uma instituição foi selecionada e temos o ID da criança, fazer a associação
        if (selectedInstituicao && childId) {
          try {
            await fetch(`https://oportunyfam-back-end.onrender.com/v1/oportunyfam/criancas/${childId}/instituicoes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id_instituicao: parseInt(selectedInstituicao)
              }),
            });
          } catch (error) {
            console.error("Erro ao associar instituição:", error);
          }
        }

        alert("Filho adicionado com sucesso!");
        setFormData({
          nome: "",
          foto_perfil: "",
          email: "",
          cpf: "",
          senha: "",
          data_nascimento: "",
          id_sexo: 1,
        });
        setSelectedInstituicao("");
        onChildAdded?.();
        onClose();
      } else {
        const errorData = await response.text();
        try {
          const errorJson = JSON.parse(errorData);
          alert(errorJson.messagem || "Erro ao adicionar filho");
        } catch {
          alert("Erro ao adicionar filho: " + response.status);
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Adicionar Filho</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>CPF *</label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData({ ...formData, cpf: value });
              }}
              placeholder="00000000000"
              maxLength={11}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Senha *</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Data de Nascimento *</label>
            <input
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Sexo *</label>
            <select
              value={formData.id_sexo}
              onChange={(e) => setFormData({ ...formData, id_sexo: parseInt(e.target.value) })}
              required
            >
              <option value={1}>Masculino</option>
              <option value={2}>Feminino</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Escolha a Instituição</label>
            <select
              value={selectedInstituicao}
              onChange={(e) => setSelectedInstituicao(e.target.value)}
            >
              <option value="">Selecione uma instituição</option>
              {Array.isArray(instituicoes) && instituicoes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nome}
                </option>
              ))}
            </select>
          </div>



          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Adicionando..." : "Adicionar Filho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildModal;