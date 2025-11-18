# Configuração de Email para Recuperação de Senha - OportunyFam

## 🚀 Implementação Rápida com EmailJS (Recomendado)

### 1. Instalar Dependência
```bash
npm install @emailjs/browser
```

### 2. Criar Conta no EmailJS
1. Acesse [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crie uma conta gratuita (permite 200 emails/mês)
3. Confirme seu email

### 3. Configurar Serviço de Email
1. No painel do EmailJS, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha seu provedor (Gmail recomendado)
4. Configure com suas credenciais
5. Anote o **Service ID** gerado

### 4. Criar Template de Email
1. Vá em **Email Templates**
2. Clique em **Create New Template**
3. Use este template:

**Template ID:** `template_password_reset`

**Subject:** `🔐 Código de Recuperação de Senha - {{company_name}}`

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; color: white; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .code-box { background: #f8f9fa; border: 2px dashed #FF9800; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #FF9800; letter-spacing: 4px; font-family: monospace; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{company_name}}</div>
            <p>Conectando famílias a oportunidades</p>
        </div>
        <div class="content">
            <h2>Olá, {{to_name}}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>{{company_name}}</strong>.</p>
            
            <div class="code-box">
                <p><strong>Seu código de verificação:</strong></p>
                <div class="code">{{reset_code}}</div>
                <p><small>Este código expira em {{expires_in}}</small></p>
            </div>
            
            <h3>Como usar este código:</h3>
            <ol>
                <li>Volte para a tela de recuperação de senha</li>
                <li>Digite o código de 6 dígitos acima</li>
                <li>Crie uma nova senha segura</li>
                <li>Faça login com sua nova senha</li>
            </ol>
            
            <p><strong>⚠️ Importante:</strong> Se você não solicitou esta recuperação, ignore este email.</p>
        </div>
        <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p><strong>{{company_name}}</strong> - {{current_year}}</p>
        </div>
    </div>
</body>
</html>
```

### 5. Configurar Chaves
1. Vá em **Account** → **General**
2. Copie sua **Public Key**
3. Atualize o arquivo `src/services/realEmailService.ts`:

```typescript
const EMAIL_CONFIG: EmailConfig = {
  serviceId: 'SEU_SERVICE_ID_AQUI',     // Ex: service_abc123
  templateId: 'template_password_reset',  // Nome do template criado
  publicKey: 'SUA_PUBLIC_KEY_AQUI'       // Ex: user_abc123def456
}
```

### 6. Testar Implementação
```typescript
// Teste no console do navegador
import { realEmailService } from './src/services/realEmailService'

realEmailService.sendPasswordResetEmail('seu-email@teste.com', '123456', 'Seu Nome')
  .then(() => console.log('Email enviado!'))
  .catch(err => console.error('Erro:', err))
```

## 🔧 Alternativas de Implementação

### Opção 1: SendGrid (Profissional)
```bash
npm install @sendgrid/mail
```

```typescript
// backend/emailService.js
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendPasswordResetEmail = async (email, code, name) => {
  const msg = {
    to: email,
    from: 'noreply@oportunyfam.com',
    subject: '🔐 Código de Recuperação - OportunyFam',
    html: `<strong>Seu código: ${code}</strong>`
  }
  
  return await sgMail.send(msg)
}
```

### Opção 2: Nodemailer (Backend)
```bash
npm install nodemailer
```

```typescript
// backend/emailService.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendPasswordResetEmail = async (email, code, name) => {
  return await transporter.sendMail({
    from: '"OportunyFam" <noreply@oportunyfam.com>',
    to: email,
    subject: '🔐 Código de Recuperação - OportunyFam',
    html: `<h2>Seu código: ${code}</h2>`
  })
}
```

### Opção 3: API Própria
Crie um endpoint no seu backend:

```typescript
// backend/routes/email.js
app.post('/v1/oportunyfam/send-email', async (req, res) => {
  const { to, subject, html } = req.body
  
  try {
    // Implementar envio de email
    await sendEmail(to, subject, html)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar email' })
  }
})
```

## 🔒 Configurações de Segurança

### Variáveis de Ambiente
```env
# .env.local
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_password_reset
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_abc123def456

# Para backend
SENDGRID_API_KEY=SG.abc123...
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app
```

### Rate Limiting
```typescript
// Implementar no authService.ts
const emailAttempts = new Map()

const checkRateLimit = (email: string) => {
  const now = Date.now()
  const attempts = emailAttempts.get(email) || []
  
  // Limpar tentativas antigas (1 hora)
  const recentAttempts = attempts.filter(time => now - time < 3600000)
  
  if (recentAttempts.length >= 3) {
    throw new Error('Muitas tentativas. Tente novamente em 1 hora.')
  }
  
  recentAttempts.push(now)
  emailAttempts.set(email, recentAttempts)
}
```

## 📱 Teste de Funcionalidade

### 1. Teste Manual
1. Abra o modal de recuperação de senha
2. Digite um email válido da base de dados
3. Verifique se o código chegou no email
4. Digite o código recebido
5. Defina uma nova senha
6. Teste o login com a nova senha

### 2. Teste de Console
```javascript
// No console do navegador
sessionStorage.getItem('reset_code_seu-email@teste.com')
// Deve mostrar o código gerado
```

### 3. Logs de Debug
```typescript
// Adicionar no authService.ts
console.log('Código gerado:', resetCode)
console.log('Email enviado para:', email)
console.log('Nome do usuário:', userName)
```

## 🚨 Troubleshooting

### Problema: Email não chega
**Soluções:**
- Verificar spam/lixo eletrônico
- Confirmar configuração do EmailJS
- Verificar console do navegador para erros
- Testar com email diferente

### Problema: Código inválido
**Soluções:**
- Verificar se código não expirou (15 min)
- Limpar sessionStorage e tentar novamente
- Verificar se email está correto

### Problema: Erro de CORS
**Soluções:**
- EmailJS não tem problema de CORS
- Para APIs próprias, configurar headers CORS
- Usar proxy no desenvolvimento

## ✅ Checklist Final

- [ ] EmailJS configurado e testado
- [ ] Template de email criado
- [ ] Chaves atualizadas no código
- [ ] Teste de envio funcionando
- [ ] Código de recuperação validado
- [ ] Nova senha sendo salva
- [ ] Rate limiting implementado
- [ ] Logs de debug removidos
- [ ] Teste completo do fluxo

## 📞 Suporte

Se precisar de ajuda:
1. Documentação EmailJS: https://www.emailjs.com/docs/
2. Console do navegador para debug
3. Verificar logs do servidor
4. Testar com diferentes provedores de email

**Status Atual:** ✅ Sistema implementado e pronto para uso com EmailJS