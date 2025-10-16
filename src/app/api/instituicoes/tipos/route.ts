import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/config'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/tipoInstituicoes`)
    
    if (!response.ok) {
      throw new Error('Erro ao carregar tipos de instituição')
    }

    const data = await response.json()

    // Verifica se a resposta tem a estrutura esperada
    if (!data.status || !data.tipos_instituicao || !Array.isArray(data.tipos_instituicao)) {
      console.error('Estrutura de resposta inválida:', data)
      throw new Error('Formato de resposta inválido')
    }

    // Mapeia os dados da API para o formato esperado pelo componente MultiSelect
    const mappedData = data.tipos_instituicao.map((item: any) => ({
      value: item.id.toString(),
      label: item.nome
    }))

    return NextResponse.json(mappedData, { status: 200 })
  } catch (error) {
    console.error('Erro ao carregar tipos de instituição:', error)
    
    // Retorna opções padrão em caso de erro
    const defaultOptions = [
      { value: 'educacao', label: 'Educação' },
      { value: 'saude', label: 'Saúde' },
      { value: 'assistencia_social', label: 'Assistência Social' },
      { value: 'cultura', label: 'Cultura' },
      { value: 'esporte', label: 'Esporte' },
      { value: 'meio_ambiente', label: 'Meio Ambiente' }
    ]

    return NextResponse.json(defaultOptions, { status: 200 })
  }
}
