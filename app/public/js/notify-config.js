// Configuração global do simply-notify
function showNotification(message, type = 'info', duration = 3000) {
    if (typeof new_notify !== 'undefined') {
        new_notify({
            status: type, // success, error, warning, info
            title: type === 'success' ? 'Sucesso!' : 
                   type === 'error' ? 'Erro!' : 
                   type === 'warning' ? 'Atenção!' : 'Informação',
            text: message,
            effect: 'fade',
            speed: 300,
            customClass: null,
            customIcon: null,
            showIcon: true,
            showCloseButton: true,
            autoclose: true,
            autotimeout: duration,
            gap: 20,
            distance: 20,
            type: 1,
            position: 'right top'
        });
    } else {
        // Fallback para alert se simply-notify não estiver carregado
        alert(message);
    }
}

// Funções de conveniência
function showSuccess(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

function showError(message, duration = 4000) {
    showNotification(message, 'error', duration);
}

function showWarning(message, duration = 3500) {
    showNotification(message, 'warning', duration);
}

function showInfo(message, duration = 3000) {
    showNotification(message, 'info', duration);
}