// Serviço de email real usando EmailJS (gratuito e fácil de configurar)
// Para usar: npm install @emailjs/browser

interface EmailConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

// Configuração do EmailJS (você precisa criar uma conta em emailjs.com)
const EMAIL_CONFIG: EmailConfig = {
  serviceId: 'service_oportunyfam', // Substitua pelo seu Service ID
  templateId: 'template_password_reset', // Substitua pelo seu Template ID
  publicKey: 'YOUR_PUBLIC_KEY' // Substitua pela sua Public Key
}

export const realEmailService = {
  // Enviar email de recuperação de senha
  async sendPasswordResetEmail(userEmail: string, resetCode: string, userName?: string) {
    try {
      // Importação dinâmica do EmailJS (apenas no cliente)
      if (typeof window === 'undefined') {
        throw new Error('EmailJS só funciona no cliente')
      }

      const emailjs = await import('@emailjs/browser')
      
      const templateParams = {
        to_email: userEmail,
        to_name: userName || 'Usuário',
        reset_code: resetCode,
        company_name: 'OportunyFam',
        expires_in: '15 minutos',
        current_year: new Date().getFullYear()
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
  },

  // Alternativa usando Fetch para API própria de email
  async sendEmailViaAPI(userEmail: string, resetCode: string, userName?: string) {
    try {
      const emailData = {
        to: userEmail,
        subject: '🔐 Código de Recuperação de Senha - OportunyFam',
        html: this.createEmailTemplate(userEmail, resetCode, userName),
        text: this.createTextTemplate(userEmail, resetCode, userName)
      }

      // Enviar para seu próprio endpoint de email (se existir)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar email')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro no envio via API:', error)
      throw error
    }
  },

  // Template HTML profissional
  createEmailTemplate(userEmail: string, resetCode: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - OportunyFam</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; color: #333; background: #f8f9fa;
        }
        .container { 
            max-width: 600px; margin: 40px auto; background: white;
            border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            padding: 40px 30px; text-align: center; color: white;
        }
        .logo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555; margin-bottom: 30px; }
        .code-container { 
            background: #f8f9fa; border: 2px dashed #FF9800; border-radius: 12px;
            padding: 30px; text-align: center; margin: 30px 0;
        }
        .code-label { 
            font-size: 14px; color: #666; margin-bottom: 8px;
            text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
        }
        .code { 
            font-size: 36px; font-weight: 700; color: #FF9800;
            letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;
        }
        .code-note { font-size: 12px; color: #888; margin-top: 8px; }
        .instructions { 
            background: #fff3cd; border-left: 4px solid #ffc107;
            padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;
        }
        .instructions h3 { font-size: 16px; font-weight: 600; color: #856404; margin-bottom: 12px; }
        .instructions ol { color: #856404; padding-left: 20px; }
        .instructions li { margin-bottom: 8px; font-size: 14px; }
        .security { 
            background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px;
            padding: 20px; margin: 30px 0;
        }
        .security h3 { font-size: 16px; font-weight: 600; color: #1976d2; margin-bottom: 8px; }
        .security p { font-size: 14px; color: #1976d2; }
        .footer { 
            background: #f8f9fa; padding: 30px; text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer-text { font-size: 14px; color: #666; margin-bottom: 15px; }
        .company { font-size: 12px; color: #888; line-height: 1.5; }
        .company strong { color: #FF9800; font-weight: 600; }
        @media (max-width: 600px) {
            .container { margin: 20px; border-radius: 12px; }
            .header, .content, .footer { padding: 25px 20px; }
            .code { font-size: 28px; letter-spacing: 4px; }
            .instructions, .security { margin: 20px 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OportunyFam</div>
            <div class="tagline">Conectando famílias a oportunidades</div>
        </div>
        <div class="content">
            <div class="greeting">Olá${userName ? `, ${userName}` : ''}!</div>
            <div class="message">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>OportunyFam</strong>. 
                Use o código abaixo para continuar com a recuperação.
            </div>
            <div class="code-container">
                <div class="code-label">Código de Verificação</div>
                <div class="code">${resetCode}</div>
                <div class="code-note">Este código expira em 15 minutos</div>
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
                <p>Se você não solicitou esta recuperação, ignore este email. Sua conta permanecerá segura.</p>
            </div>
        </div>
        <div class="footer">
            <div class="footer-text">Este é um email automático, não responda a esta mensagem.</div>
            <div class="company">
                <strong>OportunyFam</strong><br>
                Plataforma de conexão entre famílias e instituições<br>
                Criando pontes para um futuro melhor
            </div>
        </div>
    </div>
</body>
</html>`
  },

  // Template de texto simples
  createTextTemplate(userEmail: string, resetCode: string, userName?: string): string {
    return `
OportunyFam - Recuperação de Senha

Olá${userName ? `, ${userName}` : ''}!

Recebemos uma solicitação para redefinir a senha da sua conta no OportunyFam.

Seu código de verificação é: ${resetCode}

Este código expira em 15 minutos.

Como usar este código:
1. Volte para a tela de recuperação de senha
2. Digite o código de 6 dígitos
3. Crie uma nova senha segura
4. Faça login com sua nova senha

IMPORTANTE: Se você não solicitou esta recuperação de senha, ignore este email. Sua conta permanecerá segura.

--
OportunyFam
Conectando famílias a oportunidades
    `
  }
}

// Configuração para EmailJS - Template que você deve criar no painel do EmailJS
export const EMAILJS_TEMPLATE_GUIDE = `
Para configurar o EmailJS:

1. Acesse https://www.emailjs.com/ e crie uma conta gratuita
2. Crie um novo serviço de email (Gmail, Outlook, etc.)
3. Crie um template com as seguintes variáveis:

Template Name: Password Reset - OportunyFam
Template ID: template_password_reset

Variáveis do template:
- {{to_email}} - Email do destinatário
- {{to_name}} - Nome do usuário
- {{reset_code}} - Código de 6 dígitos
- {{company_name}} - Nome da empresa (OportunyFam)
- {{expires_in}} - Tempo de expiração
- {{current_year}} - Ano atual

Subject: 🔐 Código de Recuperação de Senha - {{company_name}}

Body: Use o HTML template acima, substituindo as variáveis pelos placeholders do EmailJS

4. Copie o Service ID, Template ID e Public Key para EMAIL_CONFIG
5. Instale a dependência: npm install @emailjs/browser
`