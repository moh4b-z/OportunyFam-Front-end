import emailjs from '@emailjs/browser'

// Configuração do EmailJS - SUBSTITUA PELAS SUAS CHAVES
const EMAIL_CONFIG = {
  serviceId: 'service_oportunyfam',
  templateId: 'template_password_reset', 
  publicKey: 'YOUR_PUBLIC_KEY' // Substitua pela sua chave pública
}

export const emailService = {
  async sendPasswordResetEmail(userEmail: string, resetCode: string, userName: string = 'Usuário') {
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        reset_code: resetCode,
        company_name: 'OportunyFam',
        expires_in: '15 minutos',
        current_year: new Date().getFullYear().toString()
      }

      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams,
        EMAIL_CONFIG.publicKey
      )

      if (response.status === 200) {
        return {
          success: true,
          message: 'Email enviado com sucesso'
        }
      } else {
        throw new Error('Falha no envio do email')
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      throw new Error('Erro ao enviar email de recuperação')
    }
  }
}

// Template HTML que você deve usar no EmailJS
export const EMAIL_TEMPLATE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; color: white; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555; margin-bottom: 30px; }
        .code-box { background: #f8f9fa; border: 2px dashed #FF9800; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; }
        .code-label { font-size: 14px; color: #666; margin-bottom: 8px; font-weight: 600; }
        .code { font-size: 32px; font-weight: bold; color: #FF9800; letter-spacing: 6px; font-family: monospace; margin: 10px 0; }
        .code-note { font-size: 12px; color: #888; margin-top: 8px; }
        .instructions { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; }
        .instructions h3 { font-size: 16px; font-weight: 600; color: #856404; margin-bottom: 12px; }
        .instructions ol { color: #856404; padding-left: 20px; }
        .instructions li { margin-bottom: 8px; font-size: 14px; }
        .security { background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; margin: 25px 0; border-radius: 8px; }
        .security h3 { font-size: 16px; font-weight: 600; color: #1976d2; margin-bottom: 8px; }
        .security p { font-size: 14px; color: #1976d2; margin: 0; }
        .footer { background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer-text { font-size: 14px; color: #666; margin-bottom: 10px; }
        .company { font-size: 12px; color: #888; }
        .company strong { color: #FF9800; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{company_name}}</div>
            <div class="tagline">Conectando famílias a oportunidades</div>
        </div>
        <div class="content">
            <div class="greeting">Olá, {{to_name}}!</div>
            <div class="message">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>{{company_name}}</strong>. 
                Use o código abaixo para continuar com a recuperação.
            </div>
            <div class="code-box">
                <div class="code-label">CÓDIGO DE VERIFICAÇÃO</div>
                <div class="code">{{reset_code}}</div>
                <div class="code-note">Este código expira em {{expires_in}}</div>
            </div>
            <div class="instructions">
                <h3>🔐 Como usar este código:</h3>
                <ol>
                    <li>Volte para a tela de recuperação de senha</li>
                    <li>Digite o código de 6 dígitos acima</li>
                    <li>Crie uma nova senha segura</li>
                    <li>Faça login com sua nova senha</li>
                </ol>
            </div>
            <div class="security">
                <h3>🛡️ Importante para sua segurança:</h3>
                <p>Se você não solicitou esta recuperação de senha, ignore este email. Sua conta permanecerá segura e nenhuma alteração será feita.</p>
            </div>
        </div>
        <div class="footer">
            <div class="footer-text">Este é um email automático, não responda a esta mensagem.</div>
            <div class="company">
                <strong>{{company_name}}</strong> - {{current_year}}<br>
                Plataforma de conexão entre famílias e instituições
            </div>
        </div>
    </div>
</body>
</html>
`