import { UsuarioRequest } from '@/types'
import { API_BASE_URL } from './config'

// Serviços de Usuários
export const userService = {
  async register(data: UsuarioRequest) {
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

    try {
      const response = await fetch(`${API_BASE_URL}/Usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsibleData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.')
        }
        throw new Error(errorData.message || 'Não foi possível concluir o cadastro.')
      }

      return response.json()
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        : (err?.message || 'Erro de conexão. Verifique sua internet.')
      throw new Error(msg)
    }
  }
}
