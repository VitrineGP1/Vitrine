// Polyfill para simplyNotify se não estiver disponível
if (typeof simplyNotify === 'undefined') {
    console.log('🔧 Carregando polyfill para simplyNotify...');
    
    window.simplyNotify = {
        success: function(message, title = 'Sucesso') {
            console.log('✅ ' + title + ': ' + message);
            this.showNotification(message, title, 'success');
        },
        
        error: function(message, title = 'Erro') {
            console.log('❌ ' + title + ': ' + message);
            this.showNotification(message, title, 'error');
        },
        
        warning: function(message, title = 'Aviso') {
            console.log('⚠️ ' + title + ': ' + message);
            this.showNotification(message, title, 'warning');
        },
        
        info: function(message, title = 'Informação') {
            console.log('ℹ️ ' + title + ': ' + message);
            this.showNotification(message, title, 'info');
        },
        
        showNotification: function(message, title, type) {
            // Criar elemento de notificação se não existir
            let notification = document.getElementById('simplyNotify-polyfill');
            
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'simplyNotify-polyfill';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    z-index: 10000;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: all 0.3s ease;
                `;
                document.body.appendChild(notification);
            }
            
            // Definir cores baseadas no tipo
            const colors = {
                success: '#4CAF50',
                error: '#f44336',
                warning: '#ff9800',
                info: '#2196F3'
            };
            
            notification.style.backgroundColor = colors[type] || '#333';
            notification.innerHTML = `
                <strong>${title}</strong><br>
                ${message}
            `;
            
            // Mostrar notificação
            notification.style.display = 'block';
            notification.style.opacity = '1';
            
            // Auto-esconder após 5 segundos
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 300);
            }, 5000);
        }
    };
    
    console.log('✅ Polyfill simplyNotify carregado');
}