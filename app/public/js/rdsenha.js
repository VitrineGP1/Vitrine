require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Conexão com MongoDB via variável de ambiente
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro MongoDB:', err));

// Schema e modelo do usuário
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const User = mongoose.model('User ', UserSchema);

// Configuração do Nodemailer (exemplo com Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,       // seu e-mail (defina na variável de ambiente)
        pass: process.env.EMAIL_PASS        // senha de app ou senha (defina na variável de ambiente)
    }
});

// Rota para solicitar redefinição de senha
app.post('/api/request_password_reset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });
        }

        // Gerar token
        const token = crypto.randomBytes(20).toString('hex');

        // Definir expiração do token (1 hora)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        // Link para redefinir senha (ajuste a URL para seu frontend)
        const resetUrl = `http://localhost:3000/reset_password.html?token=${token}`;

        // Enviar e-mail
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Redefinição de senha',
            text: `Você está recebendo este e-mail porque solicitou a redefinição da sua senha.\n\n
Por favor, clique no link abaixo ou cole no seu navegador para redefinir sua senha:\n\n
${resetUrl}\n\n
Se você não solicitou, ignore este e-mail.\n`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'E-mail com instruções enviado.' });
    } catch (error) {
        console.error('Erro no servidor:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Rota para redefinir a senha
app.post('/api/reset_password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualizar senha e limpar token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro no servidor:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});