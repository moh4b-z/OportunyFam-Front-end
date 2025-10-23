import { ResponsibleData } from '@/types'
import { API_BASE_URL } from './config'

// Serviços de Usuários
export const userService = {
  async register(data: ResponsibleData) {
    const {
      nome,
      foto_perfil,
      email,
      senha,
      data_nascimento,
      cpf,
      telefone,
      id_sexo,
      id_tipo_nivel,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    } = data

    // Validações básicas
    if (!nome || !email || !senha || !data_nascimento || !cpf || !telefone || !id_sexo || !cep) {
      throw new Error('Campos obrigatórios não preenchidos')
    }

    const responsibleData = {
      nome,
      foto_perfil: foto_perfil || "",
      email,
      senha,
      data_nascimento,
      cpf,
      telefone,
      id_sexo: parseInt(id_sexo.toString()),
      id_tipo_nivel: id_tipo_nivel || 1,
      cep,
      logradouro,
      numero: numero || "",
      complemento: complemento || "",
      bairro,
      cidade,
      estado
    }

    const response = await fetch(`${API_BASE_URL}/Usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erro ao cadastrar usuário')
    }

    return response.json()
  }
}
