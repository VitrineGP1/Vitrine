document.addEventListener('DOMContentLoaded', function() {
    setupSidebarNavigation();
});

function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all menu items
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
}

function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
}