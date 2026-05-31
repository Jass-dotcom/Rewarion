// ====== SISTEMA DE STAMINA MEJORADO ======

// Estructura de datos del usuario
let datosUsuario = {
    stamina: 50,
    staminaMax: 100,
    dinero: 0,
    ultimaRegeneracion: Date.now(),
    items: {
        boost_pequeño: 0,
        boost_mediano: 0,
        boost_grande: 0,
        rellenar: 0
    },
    misiones: {
        videos: 0,
        juego: 0,
        desafio: 0
    },
    historial: []
};

// Inicializar datos
function inicializarDatos() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        alert('Debes iniciar sesión');
        window.location.href = 'login.html?mode=login';
        return;
    }

    const datoGuardado = localStorage.getItem('datosStamina_' + usuarioActual.usuario);
    if (datoGuardado) {
        datosUsuario = JSON.parse(datoGuardado);
    } else {
        datosUsuario.dinero = 100; // Dinero inicial
        guardarDatos();
    }
}

// Guardar datos en localStorage
function guardarDatos() {
    const usuarioActual = obtenerUsuarioActual();
    localStorage.setItem('datosStamina_' + usuarioActual.usuario, JSON.stringify(datosUsuario));
}

// Actualizar interfaz
function actualizarUI() {
    document.getElementById('staminaActual').textContent = Math.floor(datosUsuario.stamina);
    document.getElementById('staminaMax').textContent = '/' + datosUsuario.staminaMax;
    document.getElementById('dineroTotal').textContent = datosUsuario.dinero;

    // Actualizar barra de stamina
    const porcentaje = (datosUsuario.stamina / datosUsuario.staminaMax) * 100;
    document.getElementById('barraRelleno').style.width = porcentaje + '%';

    // Actualizar contador de items
    document.getElementById('boostsPequeños').textContent = datosUsuario.items.boost_pequeño;
    document.getElementById('boostsMedianos').textContent = datosUsuario.items.boost_mediano;
    document.getElementById('boostsGrandes').textContent = datosUsuario.items.boost_grande;
    document.getElementById('rellenos').textContent = datosUsuario.items.rellenar;

    // Actualizar contadores de misiones
    document.getElementById('videosContador').textContent = datosUsuario.misiones.videos + '/3';
    document.getElementById('juegoContador').textContent = datosUsuario.misiones.juego + '/1';
    document.getElementById('desafioContador').textContent = datosUsuario.misiones.desafio + '/1';

    // Actualizar historial
    actualizarHistorial();
}

// ====== SISTEMA DE REGENERACIÓN ======

function iniciarRegeneracion() {
    setInterval(function() {
        if (datosUsuario.stamina < datosUsuario.staminaMax) {
            datosUsuario.stamina += 0.5; // 0.5 stamina cada segundo = 30 stamina por minuto
            if (datosUsuario.stamina > datosUsuario.staminaMax) {
                datosUsuario.stamina = datosUsuario.staminaMax;
            }
            guardarDatos();
            actualizarUI();
        }
        actualizarTiempoRegeneracion();
    }, 1000);
}

function actualizarTiempoRegeneracion() {
    if (datosUsuario.stamina >= datosUsuario.staminaMax) {
        document.getElementById('tiempoRegeneracion').textContent = '✅ Stamina llena';
        document.getElementById('tiempoRegeneracion').style.color = '#4CAF50';
    } else {
        const staminaFaltante = Math.ceil(datosUsuario.staminaMax - datosUsuario.stamina);
        const segundosFaltantes = Math.ceil(staminaFaltante / 0.5);
        const minutos = Math.floor(segundosFaltantes / 60);
        const segundos = segundosFaltantes % 60;
        document.getElementById('tiempoRegeneracion').textContent = `Regenerándose: ${minutos}m ${segundos}s`;
        document.getElementById('tiempoRegeneracion').style.color = '#FFD60A';
    }
}

// ====== MISIONES ======

function iniciarVideo() {
    if (datosUsuario.stamina < 5) {
        alert('No tienes suficiente stamina');
        return;
    }

    if (datosUsuario.misiones.videos >= 3) {
        alert('Ya completaste las 3 misiones de hoy');
        return;
    }

    window.location.href = 'https://www.revenuecpmgate.com/md4p9qh1?key=2d9ed4c9b12b7e402b5d01456549f844';

    // Simular ganancia (después de X segundos)
    setTimeout(function() {
        datosUsuario.stamina -= 5;
        datosUsuario.stamina += 10;
        datosUsuario.misiones.videos += 1;
        datosUsuario.dinero += 5;
        agregarAlHistorial('📺 Ver video', '+10 ⚡, +5 💰');
        guardarDatos();
        actualizarUI();
        alert('¡Video completado! +10 ⚡');
    }, 30000); // 30 segundos
}

function irAlJuego() {
    if (datosUsuario.stamina < 10) {
        alert('No tienes suficiente stamina para jugar');
        return;
    }

    if (datosUsuario.misiones.juego >= 1) {
        alert('Ya completaste la misión de jugar hoy');
        return;
    }

    window.location.href = 'PJuego.html';
    // Se debe llamar completarMisionJuego() al terminar el juego
}

function completarMisionJuego() {
    datosUsuario.stamina -= 10;
    datosUsuario.stamina += 15;
    datosUsuario.misiones.juego += 1;
    datosUsuario.dinero += 10;
    agregarAlHistorial('🎮 Jugar partida', '+15 ⚡, +10 💰');
    guardarDatos();
    actualizarUI();
    alert('¡Partida completada! +15 ⚡');
}

function iniciarDesafio() {
    if (datosUsuario.stamina < 20) {
        alert('No tienes suficiente stamina para el desafío');
        return;
    }

    if (datosUsuario.misiones.desafio >= 1) {
        alert('Ya completaste el desafío de hoy');
        return;
    }

    alert('🏆 Debes ganar 100 puntos en el juego para completar el desafío');
    window.location.href = 'PJuego.html';
}

function completarDesafio() {
    datosUsuario.stamina -= 20;
    datosUsuario.stamina += 20;
    datosUsuario.misiones.desafio += 1;
    datosUsuario.dinero += 20;
    agregarAlHistorial('🏆 Desafío especial', '+20 ⚡, +20 💰');
    guardarDatos();
    actualizarUI();
    alert('¡Desafío completado! +20 ⚡');
}

// ====== TIENDA ======

function comprarProducto(tipo, costo, stamina) {
    if (datosUsuario.dinero < costo) {
        alert(`No tienes suficientes coins. Necesitas ${costo - datosUsuario.dinero} más`);
        return;
    }

    // Restar dinero
    datosUsuario.dinero -= costo;

    // Agregar stamina o item
    if (tipo === 'rellenar') {
        datosUsuario.stamina = datosUsuario.staminaMax;
        agregarAlHistorial('🔄 Regeneración rápida', `+${stamina} ⚡ (LLENO)`, costo);
    } else {
        datosUsuario.stamina += stamina;
        if (datosUsuario.stamina > datosUsuario.staminaMax) {
            datosUsuario.stamina = datosUsuario.staminaMax;
        }
        datosUsuario.items[tipo] += 1;
        agregarAlHistorial(`⚡ Compra: ${tipo.replace('_', ' ')}`, `+${stamina} ⚡`, costo);
    }

    guardarDatos();
    actualizarUI();
    alert(`✅ Compra realizada! -${costo} 💰`);
}

// ====== OTRAS OPCIONES ======

function abrirMuroRecompensas() {
    alert('Abriendo Muro de Recompensas...');
    window.open('https://www.revenuecpmgate.com/md4p9qh1?key=2d9ed4c9b12b7e402b5d01456549f844', '_blank');
}

function abrirPayPal() {
    alert('Por favor, completa el proceso de pago en PayPal');
    window.open('https://www.paypal.com', '_blank');
}

function compartirReferido() {
    const usuarioActual = obtenerUsuarioActual();
    const codigo = 'REWARION' + usuarioActual.usuario.toUpperCase();
    alert(`Tu código de referido es: ${codigo}\n\nComparte este código con tus amigos y obtén +10 ⚡ por cada registro.`);
}

function abrirFAQ() {
    window.location.href = 'Faq.html';
}

function abrirContacto() {
    window.location.href = 'Contacto.html';
}

// ====== HISTORIAL ======

function agregarAlHistorial(accion, resultado, costo = 0) {
    const fecha = new Date().toLocaleTimeString('es-ES');
    datosUsuario.historial.unshift({
        fecha: fecha,
        accion: accion,
        resultado: resultado,
        costo: costo
    });

    // Mantener solo los últimos 20 registros
    if (datosUsuario.historial.length > 20) {
        datosUsuario.historial.pop();
    }
}

function actualizarHistorial() {
    const contenedor = document.getElementById('historialContenedor');

    if (datosUsuario.historial.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999;">No hay movimientos registrados</p>';
        return;
    }

    let html = '<div class="historial-lista">';
    datosUsuario.historial.forEach(item => {
        const costoText = item.costo ? ` (-${item.costo} 💰)` : '';
        html += `
            <div class="historial-item">
                <div class="historial-info">
                    <span class="historial-accion">${item.accion}</span>
                    <span class="historial-resultado">${item.resultado}${costoText}</span>
                </div>
                <span class="historial-hora">${item.fecha}</span>
            </div>
        `;
    });
    html += '</div>';
    contenedor.innerHTML = html;
}

// ====== INICIALIZAR AL CARGAR ======

document.addEventListener('DOMContentLoaded', function() {
    inicializarDatos();
    actualizarUI();
    iniciarRegeneracion();
    mostrarUsuarioEnNavbar();
});
