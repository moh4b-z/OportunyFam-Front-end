import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cep = searchParams.get('cep')

    if (!cep) {
      return NextResponse.json(
        { message: 'CEP é obrigatório' },
        { status: 400 }
      )
    }

    // Remove formatação do CEP
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { message: 'CEP deve ter 8 dígitos' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP')
    }

    const data = await response.json()

    if (data.erro) {
      return NextResponse.json(
        { message: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    // Mapeia os dados para o formato esperado
    const addressData = {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || ''
    }

    return NextResponse.json(addressData, { status: 200 })
  } catch (error) {
    console.error('Erro ao consultar CEP:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
