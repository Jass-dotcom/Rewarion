// ====== VALIDACIONES ======

function validarContrasena(contrasena) {
    const letras = (contrasena.match(/[a-zA-Z]/g) || []).length;
    const numeros = (contrasena.match(/[0-9]/g) || []).length;
    return letras >= 6 && numeros >= 2;
}

// ====== CARGAR INFORMACIÓN DEL USUARIO ======

document.addEventListener('DOMContentLoaded', function() {
    const usuarioActual = obtenerUsuarioActual();
    
    if (!usuarioActual) {
        alert('Debes iniciar sesión primero');
        window.location.href = 'login.html?mode=login';
        return;
    }
    
    // Mostrar información del usuario
    document.getElementById('usuarioActual').textContent = usuarioActual.usuario;
    document.getElementById('correoActual').textContent = usuarioActual.correo;
    
    // Manejar cambio de contraseña
    document.getElementById('formCambiarPassword').addEventListener('submit', cambiarContrasena);
    
    // Manejar eliminación de cuenta
    document.getElementById('btnEliminarCuenta').addEventListener('click', eliminarCuenta);
});

// ====== CAMBIAR CONTRASEÑA ======

function cambiarContrasena(e) {
    e.preventDefault();
    
    const usuarioActual = obtenerUsuarioActual();
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    const mensajeError = document.getElementById('mensajeError');
    
    mensajeError.textContent = '';
    
    // Validar que la contraseña actual sea correcta
    if (passwordActual !== usuarioActual.contrasena) {
        mensajeError.textContent = 'La contraseña actual es incorrecta';
        return;
    }
    
    // Validar que la nueva contraseña cumpla requisitos
    if (!validarContrasena(passwordNueva)) {
        mensajeError.textContent = 'La nueva contraseña debe tener mínimo 6 letras y 2 números';
        return;
    }
    
    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordConfirmar) {
        mensajeError.textContent = 'Las contraseñas no coinciden';
        return;
    }
    
    // Validar que no sea igual a la anterior
    if (passwordNueva === passwordActual) {
        mensajeError.textContent = 'La nueva contraseña debe ser diferente a la anterior';
        return;
    }
    
    // Obtener todos los usuarios
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Actualizar la contraseña del usuario
    usuarios = usuarios.map(u => {
        if (u.usuario === usuarioActual.usuario) {
            return {
                ...u,
                contrasena: passwordNueva
            };
        }
        return u;
    });
    
    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Actualizar el usuario actual
    usuarioActual.contrasena = passwordNueva;
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    
    // Mostrar mensaje de éxito
    alert('✅ ¡Contraseña actualizada exitosamente!');
    
    // Limpiar formulario
    document.getElementById('formCambiarPassword').reset();
    mensajeError.textContent = '';
}

// ====== ELIMINAR CUENTA ======

function eliminarCuenta() {
    const confirmacion = confirm('⚠️ ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    
    if (!confirmacion) return;
    
    const confirmacion2 = confirm('Esta es tu última oportunidad. ¿Realmente deseas eliminar tu cuenta?');
    
    if (!confirmacion2) return;
    
    const usuarioActual = obtenerUsuarioActual();
    
    // Obtener todos los usuarios
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Eliminar el usuario actual
    usuarios = usuarios.filter(u => u.usuario !== usuarioActual.usuario);
    
    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Eliminar la sesión
    localStorage.removeItem('usuarioActual');
    
    alert('❌ Tu cuenta ha sido eliminada. Serás redirigido a la página de inicio.');
    window.location.href = 'Inicio.html';
}
