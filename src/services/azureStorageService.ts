export const azureStorageService = {
  async uploadImage(file: File): Promise<string> {
    const sasToken = process.env.NEXT_PUBLIC_AZURE_STORAGE_KEY
    console.log('🔑 SAS Token:', sasToken ? 'Encontrado' : 'Não encontrado')
    
    const fileName = `${Date.now()}-${file.name}`
    const uploadUrl = `https://oportunyfam.blob.core.windows.net/images/${fileName}?${sasToken}`
    
    console.log('📤 Enviando para:', uploadUrl.split('?')[0])
    console.log('📁 Arquivo:', file.name, 'Tamanho:', file.size, 'bytes')
    
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
      
      const finalUrl = `https://oportunyfam.blob.core.windows.net/images/${fileName}`
      console.log('✅ Upload concluído! URL final:', finalUrl)
      return finalUrl
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      throw new Error('Falha ao enviar imagem')
    }
  }
}