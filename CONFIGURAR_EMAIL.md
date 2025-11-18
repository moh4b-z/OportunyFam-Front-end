# 📧 Configuração Rápida do EmailJS - 5 Minutos

## 🚀 Passo a Passo

### 1. Criar Conta EmailJS (2 minutos)
1. Acesse: https://www.emailjs.com/
2. Clique "Sign Up" 
3. Use seu email pessoal
4. Confirme o email

### 2. Configurar Serviço de Email (1 minuto)
1. No painel, clique **"Email Services"**
2. Clique **"Add New Service"**
3. Escolha **"Gmail"** (mais fácil)
4. Conecte sua conta Gmail
5. **Anote o Service ID** (ex: `service_abc123`)

### 3. Criar Template (1 minuto)
1. Clique **"Email Templates"**
2. Clique **"Create New Template"**
3. **Template Name:** `Password Reset OportunyFam`
4. **Subject:** `🔐 Código de Recuperação - OportunyFam`
5. **Content:** Cole o HTML abaixo

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; color: white; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .content { padding: 30px; }
        .code-box { background: #f8f9fa; border: 2px dashed #FF9800; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #FF9800; letter-spacing: 6px; font-family: monospace; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{company_name}}</div>
            <div>Conectando famílias a oportunidades</div>
        </div>
        <div class="content">
            <h2>Olá, {{to_name}}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>{{company_name}}</strong>.</p>
            
            <div class="code-box">
                <p><strong>SEU CÓDIGO DE VERIFICAÇÃO:</strong></p>
                <div class="code">{{reset_code}}</div>
                <p><small>Este código expira em {{expires_in}}</small></p>
            </div>
            
            <h3>Como usar:</h3>
            <ol>
                <li>Volte para a tela de recuperação</li>
                <li>Digite o código acima</li>
                <li>Crie uma nova senha</li>
                <li>Faça login normalmente</li>
            </ol>
            
            <p><strong>⚠️ Importante:</strong> Se você não solicitou esta recuperação, ignore este email.</p>
        </div>
        <div class="footer">
            <p>{{company_name}} - {{current_year}}</p>
            <p><small>Este é um email automático, não responda.</small></p>
        </div>
    </div>
</body>
</html>
```

6. **Salve o template** e anote o **Template ID**

### 4. Configurar Chaves (1 minuto)
1. Vá em **"Account"** → **"General"**
2. Copie sua **Public Key**
3. Abra o arquivo: `src/services/emailService.ts`
4. **Substitua as configurações:**

```typescript
const EMAIL_CONFIG = {
  serviceId: 'SEU_SERVICE_ID_AQUI',        // Ex: service_abc123
  templateId: 'SEU_TEMPLATE_ID_AQUI',      // Ex: template_def456  
  publicKey: 'SUA_PUBLIC_KEY_AQUI'         // Ex: user_ghi789
}
```

## ✅ Teste Rápido

1. **Salve o arquivo** `emailService.ts`
2. **Teste a recuperação** com seu próprio email
3. **Verifique sua caixa de entrada**
4. **Use o código** recebido no modal

## 🎯 Exemplo de Configuração

```typescript
// Exemplo real de configuração
const EMAIL_CONFIG = {
  serviceId: 'service_oportunyfam_123',
  templateId: 'template_password_reset_456', 
  publicKey: 'user_abc123def456ghi789'
}
```

## 🔧 Troubleshooting

### Email não chega?
- ✅ Verifique spam/lixo eletrônico
- ✅ Confirme Service ID, Template ID e Public Key
- ✅ Teste com email diferente

### Erro de configuração?
- ✅ Verifique se salvou o arquivo `emailService.ts`
- ✅ Reinicie o servidor de desenvolvimento
- ✅ Abra console do navegador para ver erros

### Template não funciona?
- ✅ Verifique se copiou o HTML completo
- ✅ Confirme que salvou o template no EmailJS
- ✅ Use exatamente as variáveis: `{{to_name}}`, `{{reset_code}}`, etc.

## 🎉 Pronto!

Após configurar, o sistema enviará emails reais para os usuários com códigos de recuperação profissionais!

**Limite gratuito:** 200 emails/mês (suficiente para teste e pequenos projetos)