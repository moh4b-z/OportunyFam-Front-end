import { AddressData } from '@/types'

export const utilsService = {
  async getCepData(cep: string): Promise<AddressData> {
    if (!cep) {
      throw new Error('CEP é obrigatório')
    }

    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP')
      }

      const data = await response.json()

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao serviço de CEP. Verifique sua conexão.'
        : (err?.message || 'Erro ao consultar CEP')
      throw new Error(msg)
    }
  },

  isPasswordStrong(password: string): boolean {
    if (typeof password !== 'string') return false
    if (password.length < 6) return false
    if (!/[A-Za-z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  },

  getPasswordStrengthMessage(): string {
    return 'A senha deve ter pelo menos 6 caracteres e conter letras e números.'
  },

  cleanDigits(value: string): string {
    return (value || '').replace(/\D/g, '')
  },

  validateCPF(cpf: string): boolean {
    const s = (cpf || '').replace(/\D/g, '')
    if (!s || s.length !== 11) return false
    if (/^(\d)\1{10}$/.test(s)) return false
    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i)) * (10 - i)
    let rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(s.charAt(9))) return false
    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i)) * (11 - i)
    rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    return rev === parseInt(s.charAt(10))
  },

  validateCNPJ(cnpj: string): boolean {
    const s = (cnpj || '').replace(/\D/g, '');
    
    if (!s || s.length !== 14 || /^(\d)\1{13}$/.test(s)) {
      return false;
    }
    
    // Primeiro dígito verificador
    let tamanho = s.length - 2;
    let numeros = s.substring(0, tamanho);
    const digitos = s.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    // Cálculo do primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0), 10)) {
      return false;
    }
    
    // Cálculo do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = s.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1), 10);
  }
}
