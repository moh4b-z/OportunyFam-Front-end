/**
 * Utilitários de formatação para o sistema OportunyFam
 * Máscaras e validações reutilizáveis
 */

/**
 * Mascara email ocultando parte do usuário e domínio
 * @example maskEmail("joao@empresa.com.br") // "j***@e******.com.br"
 */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  
  const maskedUser = user.length <= 2 
    ? "**" 
    : user[0] + "*".repeat(Math.max(2, user.length - 2));
  
  const parts = domain.split(".");
  const maskedDomain = parts[0][0] + "*".repeat(Math.max(2, parts[0].length - 2)) + "." + parts.slice(1).join(".");
  
  return `${maskedUser}@${maskedDomain}`;
}

/**
 * Formata número de telefone brasileiro
 * @example maskPhone("11987654321") // "11 98765-4321"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const d = digits.padEnd(11, "0");
  return `${d.slice(0, 2)} ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/**
 * Obtém iniciais do nome para avatar
 * @example getInitials("João Silva") // "JS"
 */
export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
