export const azureStorageService = {
  async uploadImage(file: File): Promise<string> {
    // Dados fornecidos pelo usuário para upload de imagens de perfil
    const account = 'oportunyfamstorage'
    const container = 'imagens-perfil'
    const sasToken =
      'sp=racwl&st=2025-11-18T13:06:56Z&se=2025-12-05T21:21:56Z&sv=2024-11-04&sr=c&sig=blfBJt5Lw0S9tB1mSpo%2FRufvFq5eXaPQNFI3mZ36Z5Y%3D'

    const fileName = `${Date.now()}-${file.name}`

    const baseUrl = `https://${account}.blob.core.windows.net/${container}`
    const uploadUrl = `${baseUrl}/${encodeURIComponent(fileName)}?${sasToken}`

    console.log(' Enviando para:', baseUrl)
    console.log(' Arquivo:', file.name, 'Tamanho:', file.size, 'bytes')
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        },
        body: file
      })
      
      console.log('📊 Status da resposta:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro da resposta:', errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }
      
      const finalUrl = `${baseUrl}/${encodeURIComponent(fileName)}`
      console.log('✅ Upload concluído! URL final:', finalUrl)
      return finalUrl
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      throw new Error('Falha ao enviar imagem')
    }
  }
}