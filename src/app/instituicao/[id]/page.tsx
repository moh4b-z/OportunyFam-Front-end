"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InstitutionDetailModal from "@/components/InstitutionDetailModal";

// Tipo para os dados da instituição
interface Institution {
  id?: string;
  nome: string;
  // Adicione outros campos conforme necessário
}

export default function InstitutionPage() {
  const params = useParams();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);

  // Pega o ID da URL (ex: /instituicao/agua-viva)
  const institutionId = params.id as string;

  useEffect(() => {
    // Aqui você pode buscar os dados da instituição pela ID
    // Por enquanto, vou simular com dados fixos
    if (institutionId) {
      // Simular busca da instituição
      setInstitution({
        id: institutionId,
        nome: "Instituição Água Viva" // Você pode buscar da API depois
      });
    }
  }, [institutionId]);

  const handleClose = () => {
    // Volta para a página anterior (fecha o modal)
    router.back();
  };

  if (!institution) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Carregando instituição...</p>
        </div>
      </div>
    );
  }

  return (
    <InstitutionDetailModal onClose={handleClose} />
  );
}
