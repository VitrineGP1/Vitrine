const User = require('../models/User');

const userTypes = {
    'C': 'cliente',
    'V': 'vendedor', 
    'A': 'admin'
};

const requireAuth = (requiredTypes = []) => {
    return async (req, res, next) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Não autorizado. Faça login.' 
                });
            }

            // Buscar usuário no banco
            const user = await User.findById(req.session.userId);
            if (!user) {
                req.session.destroy();
                return res.status(401).json({ 
                    success: false,
                    error: 'Sessão expirada. Faça login novamente.' 
                });
            }

            // Converter tipo do banco para formato legível
            const userType = userTypes[user.TIPO_USUARIO];
            
            // Verificar tipo se necessário
            if (requiredTypes.length > 0 && 
                !requiredTypes.includes(userType)) {
                return res.status(403).json({ 
                    success: false,
                    error: 'Acesso não autorizado para seu tipo de conta.' 
                });
            }

            req.user = {
                ID_USUARIO: user.ID_USUARIO,
                NOME_USUARIO: user.NOME_USUARIO,
                EMAIL_USUARIO: user.EMAIL_USUARIO,
                TIPO_USUARIO: user.TIPO_USUARIO,
                TIPO_USUARIO_LEGIVEL: userType,
                IMAGEM_PERFIL_BASE64: user.IMAGEM_PERFIL_BASE64,
                CELULAR_USUARIO: user.CELULAR_USUARIO,
                LOGRADOURO_USUARIO: user.LOGRADOURO_USUARIO,
                BAIRRO_USUARIO: user.BAIRRO_USUARIO,
                CIDADE_USUARIO: user.CIDADE_USUARIO,
                UF_USUARIO: user.UF_USUARIO,
                DOCUMENTO: user.DOCUMENTO
            };
            
            next();
        } catch (error) {
            console.error('Auth error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro de autenticação' 
            });
        }
    };
};


const requireAdmin = requireAuth(['admin']);
const requireVendedor = requireAuth(['vendedor']);
const requireCliente = requireAuth(['cliente']);
const requireAuthAny = requireAuth();

module.exports = {
    requireAuth,
    requireAdmin,
    requireVendedor,
    requireCliente,
    requireAuthAny,
    userTypes
};