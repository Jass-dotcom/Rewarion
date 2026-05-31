// ====== SISTEMA GLOBAL DE SESIÓN ======

// Verificar si hay usuario logueado
function verificarSesion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    console.log('Usuario actual:', usuarioActual);
    if (!usuarioActual) {
        // Si no hay sesión y no estamos en login/registro, redirigir
        const paginaActual = window.location.pathname;
        if (!paginaActual.includes('login.html') && !paginaActual.includes('registro.html') && !paginaActual.includes('Inicio.html') && paginaActual !== '/') {
            // Permitir que Inicio.html se vea sin login
            // window.location.href = 'login.html';
        }
        return null;
    }
    return usuarioActual;
}

// Mostrar usuario en el navbar
function mostrarUsuarioEnNavbar() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    
    if (!usuarioActual) return;
    
    // Buscar el botón de perfil en el navbar
    const btnPerfil = document.querySelector('.header__btn_perfil');
    
    if (btnPerfil) {
        // Si hay usuario logueado, cambiar el texto y crear un menú
        if (btnPerfil.textContent.includes('Iniciar Sesión') || btnPerfil.textContent.includes('Registrarse')) {
            // Reemplazar con menú de usuario
            btnPerfil.innerHTML = `👤 ${usuarioActual.usuario}`;
            btnPerfil.style.cursor = 'pointer';
            
            // Crear menú dropdown
            const menuDropdown = document.createElement('div');
            menuDropdown.className = 'menu-dropdown';
            menuDropdown.innerHTML = `
                <a href="config.html" class="menu-item">⚙️ Configuración</a>
                <a href="#" class="menu-item" onclick="logout(event)">🚪 Cerrar Sesión</a>
            `;
            menuDropdown.style.display = 'none';
            
            btnPerfil.parentElement.style.position = 'relative';
            btnPerfil.parentElement.appendChild(menuDropdown);
            
            // Toggle del menú
            btnPerfil.addEventListener('click', function(e) {
                e.stopPropagation();
                menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
            });
            
            // Cerrar menú al hacer click afuera
            document.addEventListener('click', function() {
                menuDropdown.style.display = 'none';
            });
        }
    }
}

// Logout
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('usuarioActual');
    alert('¡Hasta luego!');
    window.location.href = 'Inicio.html';
}

// Cargar datos del usuario en páginas protegidas
function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioActual'));
}

// Forzar login en páginas que requieren autenticación
function requireLogin() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'login.html?mode=login';
    }
    return usuarioActual;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarUsuarioEnNavbar();
});
