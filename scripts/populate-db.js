// Script para popular o banco com instituições de São Paulo
// Execute: node scripts/populate-db.js

const { populateService } = require('../src/services/populateInstitutions')

async function main() {
  console.log('🚀 Iniciando população do banco de dados...')
  
  try {
    const results = await populateService.populateAllInstitutions()
    
    console.log('\n📊 Resultados:')
    console.log(`✅ Sucessos: ${results.success}`)
    console.log(`❌ Erros: ${results.errors}`)
    console.log(`📝 Total: ${results.total}`)
    
    if (results.success > 0) {
      console.log('\n🎉 População concluída com sucesso!')
    } else {
      console.log('\n⚠️ Nenhuma instituição foi inserida.')
    }
  } catch (error) {
    console.error('💥 Erro durante a população:', error)
    process.exit(1)
  }
}

main()