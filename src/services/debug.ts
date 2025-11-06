// Utilitários para debug e logs
export const DEBUG = process.env.NODE_ENV === 'development';

export function logApiResponse(endpoint: string, data: any) {
  if (DEBUG) {
    console.log(`[API Response] ${endpoint}:`, data);
  }
}

export function logInstitutionData(institution: any, source: string) {
  if (DEBUG) {
    console.log(`[Institution Data - ${source}]:`, {
      nome: institution.nome,
      endereco: institution.endereco,
      hasCoordinates: !!(institution.endereco?.latitude && institution.endereco?.longitude),
      rawData: institution
    });
  }
}

export function logGeocoding(address: string, result: any) {
  if (DEBUG) {
    console.log(`[Geocoding] ${address}:`, result);
  }
}