# API de Recuperação de Senha - OportunyFam

## Endpoints Necessários

### 1. Solicitar Código de Recuperação
**POST** `/v1/oportunyfam/recuperar-senha`

```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Código de recuperação enviado para o email",
  "expiresIn": "15 minutos"
}
```

**Respostas de Erro:**
- `404`: Email não encontrado
- `429`: Muitas tentativas (rate limiting)
- `500`: Erro interno do servidor

### 2. Verificar Código de Recuperação
**POST** `/v1/oportunyfam/verificar-codigo`

```json
{
  "email": "usuario@exemplo.com",
  "codigo": "123456"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Código válido",
  "token": "temp_reset_token_here"
}
```

**Respostas de Erro:**
- `400`: Código inválido ou expirado
- `404`: Solicitação não encontrada
- `500`: Erro interno do servidor

### 3. Redefinir Senha
**POST** `/v1/oportunyfam/redefinir-senha`

```json
{
  "email": "usuario@exemplo.com",
  "codigo": "123456",
  "novaSenha": "nova_senha_segura"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

**Respostas de Erro:**
- `400`: Código inválido, expirado ou senha muito fraca
- `404`: Solicitação não encontrada
- `500`: Erro interno do servidor

### 4. Enviar Email (Opcional - se usar serviço próprio)
**POST** `/v1/oportunyfam/send-email`

```json
{
  "to": "usuario@exemplo.com",
  "subject": "🔐 Código de Recuperação de Senha - OportunyFam",
  "html": "<html>...</html>",
  "text": "Versão em texto..."
}
```

## Implementação Recomendada no Backend

### Estrutura de Dados
```sql
-- Tabela para tokens de recuperação
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Lógica de Negócio

#### 1. Geração do Código
```javascript
// Gerar código de 6 dígitos
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Definir expiração (15 minutos)
const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
```

#### 2. Rate Limiting
```javascript
// Limitar tentativas por IP/email
const MAX_ATTEMPTS = 3;
const WINDOW_TIME = 60 * 60 * 1000; // 1 hora

// Verificar tentativas recentes
const recentAttempts = await getRecentAttempts(email, WINDOW_TIME);
if (recentAttempts >= MAX_ATTEMPTS) {
    return res.status(429).json({
        error: "Muitas tentativas. Tente novamente em 1 hora."
    });
}
```

#### 3. Validação de Senha
```javascript
function validatePassword(password) {
    return {
        minLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
}
```

#### 4. Hash da Senha
```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}
```

### Configuração de Email

#### Usando Nodemailer (Recomendado)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendPasswordResetEmail(email, code) {
    const mailOptions = {
        from: '"OportunyFam" <noreply@oportunyfam.com>',
        to: email,
        subject: '🔐 Código de Recuperação de Senha - OportunyFam',
        html: emailTemplate, // Template do frontend
        text: textVersion    // Versão texto do frontend
    };

    return await transporter.sendMail(mailOptions);
}
```

#### Provedores de Email Recomendados
1. **SendGrid** - Fácil integração, boa entregabilidade
2. **Mailgun** - Robusto para aplicações
3. **Amazon SES** - Econômico e confiável
4. **Gmail SMTP** - Para desenvolvimento/teste

### Segurança

#### Headers de Segurança
```javascript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

#### Logs de Auditoria
```javascript
// Log todas as tentativas de recuperação
function logPasswordResetAttempt(email, ip, success) {
    console.log({
        timestamp: new Date().toISOString(),
        event: 'password_reset_attempt',
        email: email,
        ip: ip,
        success: success,
        userAgent: req.get('User-Agent')
    });
}
```

### Monitoramento

#### Métricas Importantes
- Taxa de sucesso de recuperação de senha
- Tentativas por minuto/hora
- Emails não entregues (bounces)
- Códigos expirados vs utilizados

#### Alertas
- Muitas tentativas de um mesmo IP
- Falhas no envio de email
- Códigos sendo reutilizados

## Exemplo de Implementação Completa

```javascript
// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Rate limiting
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // máximo 3 tentativas por IP
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});

// 1. Solicitar código de recuperação
router.post('/recuperar-senha', 
    resetPasswordLimiter,
    body('email').isEmail().normalizeEmail(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email } = req.body;
            
            // Verificar se usuário existe
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ 
                    error: 'Email não encontrado em nossa base de dados' 
                });
            }

            // Gerar código
            const resetCode = generateResetCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            // Salvar token
            await PasswordResetToken.create({
                user_id: user.id,
                email: email,
                token: resetCode,
                expires_at: expiresAt
            });

            // Enviar email
            await sendPasswordResetEmail(email, resetCode);

            res.json({
                success: true,
                message: 'Código de recuperação enviado para o email',
                expiresIn: '15 minutos'
            });

        } catch (error) {
            console.error('Erro ao solicitar recuperação:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// 2. Verificar código
router.post('/verificar-codigo',
    body('email').isEmail().normalizeEmail(),
    body('codigo').isLength({ min: 6, max: 6 }).isNumeric(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, codigo } = req.body;

            // Buscar token válido
            const resetToken = await PasswordResetToken.findOne({
                email: email,
                token: codigo,
                used: false,
                expires_at: { $gt: new Date() }
            });

            if (!resetToken) {
                return res.status(400).json({ 
                    error: 'Código inválido ou expirado' 
                });
            }

            res.json({
                success: true,
                message: 'Código válido'
            });

        } catch (error) {
            console.error('Erro ao verificar código:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// 3. Redefinir senha
router.post('/redefinir-senha',
    body('email').isEmail().normalizeEmail(),
    body('codigo').isLength({ min: 6, max: 6 }).isNumeric(),
    body('novaSenha').isLength({ min: 6 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, codigo, novaSenha } = req.body;

            // Buscar token válido
            const resetToken = await PasswordResetToken.findOne({
                email: email,
                token: codigo,
                used: false,
                expires_at: { $gt: new Date() }
            });

            if (!resetToken) {
                return res.status(400).json({ 
                    error: 'Código inválido ou expirado' 
                });
            }

            // Hash da nova senha
            const hashedPassword = await bcrypt.hash(novaSenha, 12);

            // Atualizar senha do usuário
            await User.updateOne(
                { email: email },
                { senha: hashedPassword }
            );

            // Marcar token como usado
            await PasswordResetToken.updateOne(
                { _id: resetToken._id },
                { used: true }
            );

            res.json({
                success: true,
                message: 'Senha redefinida com sucesso'
            });

        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

module.exports = router;
```

## Testes

### Testes Unitários
```javascript
describe('Password Reset', () => {
    test('should generate 6-digit code', () => {
        const code = generateResetCode();
        expect(code).toHaveLength(6);
        expect(code).toMatch(/^\d{6}$/);
    });

    test('should validate email format', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('invalid-email')).toBe(false);
    });

    test('should hash password securely', async () => {
        const password = 'testPassword123';
        const hash = await hashPassword(password);
        expect(hash).not.toBe(password);
        expect(await bcrypt.compare(password, hash)).toBe(true);
    });
});
```

### Testes de Integração
```javascript
describe('Password Reset API', () => {
    test('POST /recuperar-senha should send reset code', async () => {
        const response = await request(app)
            .post('/v1/oportunyfam/recuperar-senha')
            .send({ email: 'test@example.com' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('POST /verificar-codigo should validate code', async () => {
        // Primeiro solicitar código
        await request(app)
            .post('/v1/oportunyfam/recuperar-senha')
            .send({ email: 'test@example.com' });

        // Depois verificar (assumindo código conhecido para teste)
        const response = await request(app)
            .post('/v1/oportunyfam/verificar-codigo')
            .send({ 
                email: 'test@example.com',
                codigo: '123456' 
            });
        
        expect(response.status).toBe(200);
    });
});
```

## Checklist de Implementação

### Backend
- [ ] Criar endpoints de recuperação de senha
- [ ] Implementar geração de códigos seguros
- [ ] Configurar rate limiting
- [ ] Implementar validação de dados
- [ ] Configurar envio de emails
- [ ] Implementar logs de auditoria
- [ ] Criar testes unitários e de integração
- [ ] Configurar monitoramento

### Frontend
- [ ] ✅ Modal de recuperação implementado
- [ ] ✅ Fluxo de 3 etapas funcionando
- [ ] ✅ Validações de entrada
- [ ] ✅ Design responsivo
- [ ] ✅ Tratamento de erros
- [ ] ✅ Loading states
- [ ] ✅ Template de email profissional

### Segurança
- [ ] Rate limiting por IP e email
- [ ] Códigos com expiração curta (15 min)
- [ ] Tokens de uso único
- [ ] Hash seguro de senhas
- [ ] Logs de auditoria
- [ ] Validação de entrada rigorosa

### UX/UI
- [ ] ✅ Fluxo intuitivo e claro
- [ ] ✅ Feedback visual adequado
- [ ] ✅ Mensagens de erro úteis
- [ ] ✅ Design profissional
- [ ] ✅ Responsividade mobile
- [ ] ✅ Acessibilidade básica