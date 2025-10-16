import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = body

    // Validações básicas
    if (!nome || !email || !senha || !data_nascimento || !cpf || !telefone || !id_sexo || !cep) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    const responsibleData = {
      nome,
      foto_perfil: foto_perfil || "",
      email,
      senha,
      data_nascimento,
      cpf,
      telefone,
      id_sexo: parseInt(id_sexo),
      id_tipo_nivel: id_tipo_nivel || 1,
      cep,
      logradouro,
      numero: numero || "",
      complemento: complemento || "",
      bairro,
      cidade,
      estado
    }

    console.log('Dados do responsável a serem enviados:', responsibleData)

    const response = await fetch('http://localhost:3030/v1/oportunyfam/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Erro ao cadastrar responsável:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
