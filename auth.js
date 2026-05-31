function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return mode === 'register' ? 'register' : 'login';
}

function updateUrlMode(mode) {
    const url = new URL(window.location);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
}

function setActivePanel(panelName) {
    const loginPanel = document.querySelector('.login-panel');
    const registroPanel = document.querySelector('.registro-panel');

    if (panelName === 'register') {
        loginPanel.classList.remove('active');
        registroPanel.classList.add('active');
        updateUrlMode('register');
    } else {
        registroPanel.classList.remove('active');
        loginPanel.classList.add('active');
        updateUrlMode('login');
    }
}

function showError(id, message) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = message;
    }
}

function clearMessages() {
    showError('loginError', '');
    showError('registroError', '');
}

function loginSubmit(event) {
    event.preventDefault();
    clearMessages();

    const usuario = document.getElementById('usuarioLogin').value.trim();
    const contrasena = document.getElementById('contrasenaLogin').value;

    if (!usuario) {
        showError('loginError', 'Por favor ingresa un usuario');
        return;
    }
    if (!contrasena) {
        showError('loginError', 'Por favor ingresa una contraseña');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);

    if (usuarioEncontrado) {
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
        alert('¡Bienvenido ' + usuarioEncontrado.usuario + '!');
        window.location.href = 'PJuego.html';
    } else {
        showError('loginError', 'Usuario o contraseña incorrectos');
    }
}

function validarCorreo(correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.(com|co|ru|es|mx|ar|pe|cl|ve|edu|org|net|gov)$/i;
    return regexCorreo.test(correo);
}

function validarContrasena(contrasena) {
    const letras = (contrasena.match(/[a-zA-Z]/g) || []).length;
    const numeros = (contrasena.match(/[0-9]/g) || []).length;
    return letras >= 6 && numeros >= 2;
}

function registroSubmit(event) {
    event.preventDefault();
    clearMessages();

    const usuario = document.getElementById('usuarioRegistro').value.trim();
    const correo = document.getElementById('correoRegistro').value.trim();
    const contrasena = document.getElementById('contrasenaRegistro').value;
    const retype = document.getElementById('retypeRegistro').value;

    if (!usuario) {
        showError('registroError', 'Por favor ingresa un usuario');
        return;
    }
    if (!correo) {
        showError('registroError', 'Por favor ingresa un correo');
        return;
    }
    if (!validarCorreo(correo)) {
        showError('registroError', 'El correo debe ser válido (ejemplo: usuario@domain.com)');
        return;
    }
    if (!contrasena) {
        showError('registroError', 'Por favor ingresa una contraseña');
        return;
    }
    if (!validarContrasena(contrasena)) {
        showError('registroError', 'La contraseña debe tener mínimo 6 letras y 2 números');
        return;
    }
    if (contrasena !== retype) {
        showError('registroError', 'Las contraseñas no coinciden');
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    if (usuarios.some(u => u.usuario === usuario)) {
        showError('registroError', 'Este usuario ya está registrado');
        return;
    }
    if (usuarios.some(u => u.correo === correo)) {
        showError('registroError', 'Este correo ya está registrado');
        return;
    }

    usuarios.push({
        usuario: usuario,
        correo: correo,
        contrasena: contrasena
    });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    document.getElementById('formRegistro').reset();
    setActivePanel('login');
}

document.addEventListener('DOMContentLoaded', function() {
    const switchToRegistro = document.getElementById('switchToRegistro');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToRegistro) {
        switchToRegistro.addEventListener('click', function(e) {
            e.preventDefault();
            setActivePanel('register');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            setActivePanel('login');
        });
    }

    document.getElementById('formLogin').addEventListener('submit', loginSubmit);
    document.getElementById('formRegistro').addEventListener('submit', registroSubmit);

    const initialMode = getModeFromUrl();
    setActivePanel(initialMode);
});
