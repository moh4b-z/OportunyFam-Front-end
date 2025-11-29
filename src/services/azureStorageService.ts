export const azureStorageService = {
  async uploadImage(file: File): Promise<string> {
    // Dados fornecidos pelo usuário para upload de imagens de perfil
    const account = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT || 'oportunyfamstorage'
    const container = process.env.NEXT_PUBLIC_AZURE_CONTAINER_PERFIL || 'imagens-perfil'
    const sasToken =
      (process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS as string) ||
      'sp=racwl&st=2025-11-18T13:06:56Z&se=2025-12-05T21:21:56Z&sv=2024-11-04&sr=c&sig=blfBJt5Lw0S9tB1mSpo%2FRufvFq5eXaPQNFI3mZ36Z5Y%3D'

    const fileName = `${Date.now()}-${file.name}`

    const baseUrl = `https://${account}.blob.core.windows.net/${container}`
    const uploadUrl = `${baseUrl}/${encodeURIComponent(fileName)}?${sasToken}`

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        },
        body: file
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`)
      }
      
      const finalUrl = `${baseUrl}/${encodeURIComponent(fileName)}`
      return finalUrl
    } catch {
      throw new Error('Falha ao enviar imagem')
    }
  },

  async uploadAudio(audioBlob: Blob, isM4a: boolean = false): Promise<string> {
    // Usa os mesmos dados de configuração para upload de áudios
    const account = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT || 'oportunyfamstorage'
    const container = process.env.NEXT_PUBLIC_AZURE_CONTAINER_PERFIL || 'imagens-perfil'
    const sasToken =
      (process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS as string) ||
      'sp=racwl&st=2025-11-18T13:06:56Z&se=2025-12-05T21:21:56Z&sv=2024-11-04&sr=c&sig=blfBJt5Lw0S9tB1mSpo%2FRufvFq5eXaPQNFI3mZ36Z5Y%3D'

    const extension = isM4a ? 'm4a' : 'webm'
    const contentType = isM4a ? 'audio/mp4' : 'audio/webm'
    const fileName = `audio-${Date.now()}.${extension}`

    const baseUrl = `https://${account}.blob.core.windows.net/${container}`
    const uploadUrl = `${baseUrl}/${encodeURIComponent(fileName)}?${sasToken}`

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': contentType
        },
        body: audioBlob
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`)
      }
      
      const finalUrl = `${baseUrl}/${encodeURIComponent(fileName)}`
      return finalUrl
    } catch {
      throw new Error('Falha ao enviar áudio')
    }
  }
}