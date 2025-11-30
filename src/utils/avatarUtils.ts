/**
 * Utilitários de gerenciamento de avatar
 */

/**
 * Salva URL do avatar no localStorage
 */
export function saveAvatarToStorage(key: string, url: string): void {
  try {
    localStorage.setItem(key, url);
  } catch (error) {
    console.error('Erro ao salvar avatar:', error);
  }
}

/**
 * Carrega URL do avatar do localStorage
 */
export function loadAvatarFromStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Erro ao carregar avatar:', error);
    return null;
  }
}

/**
 * Remove avatar do localStorage
 */
export function removeAvatarFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover avatar:', error);
  }
}

/**
 * Gera chave única para armazenamento de avatar
 */
export function generateAvatarStorageKey(identifier: string, userType: string): string {
  return `account_avatar_${userType}_${identifier.toLowerCase()}`;
}

/**
 * Converte arquivo para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
