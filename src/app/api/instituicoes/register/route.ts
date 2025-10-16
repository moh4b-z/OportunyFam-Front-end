import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      logo,
      cnpj,
      telefone,
      email,
      senha,
      descricao,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      tipos_instituicao
    } = body

    // Validações básicas
    if (!nome || !cnpj || !telefone || !email || !senha || !cep) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    if (!tipos_instituicao || tipos_instituicao.length === 0) {
      return NextResponse.json(
        { message: 'Selecione pelo menos um tipo de instituição' },
        { status: 400 }
      )
    }

    const institutionData = {
      nome,
      logo: logo || "",
      cnpj,
      telefone,
      email,
      senha,
      descricao: descricao || "",
      cep,
      logradouro,
      numero: numero || "",
      complemento: complemento || "",
      bairro,
      cidade,
      estado,
      tipos_instituicao
    }

    const response = await fetch(`${API_BASE_URL}/instituicoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Erro ao cadastrar instituição:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
