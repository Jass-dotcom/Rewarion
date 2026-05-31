
const contenedor = document.querySelector('.contenedor');
const suelo = document.getElementById('suelo');
const dyno = document.getElementById('dyno');
const scoreEl = document.getElementById('score');

let lastTime = null;
let speed = 300; // px/s
let sueloX = 0;
let obstáculos = [];
let spawnTimer = 0;
let spawnInterval = 1500;
let puntos = 0;
let juegoActivo = false;



let velocidadY = 0;
const GRAVEDAD = 1600;
const IMPULSO = 800;
let enSuelo = true;


function init() {
  dyno.classList.add('correr');
  dyno.style.bottom = '-10px';
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('touchstart', onTouchStart);
  requestAnimationFrame(loop);
  juegoActivo = true;
}


function onKeyDown(e) {
  if (!juegoActivo) return;
  if (e.code === 'ArrowUp') {
    saltar();
  }
}
function onTouchStart() {
  if (!juegoActivo) return;
  saltar();
}


function saltar() {
  if (!enSuelo) return;
  velocidadY = IMPULSO;
  enSuelo = false;
  dyno.classList.add('saltando');
  dyno.classList.remove('correr');
}

function crearObstáculo() {
  const obs = document.createElement('div');
  obs.className = 'cactus';
  obs.style.right = '-50px';
  contenedor.appendChild(obs);
  obstáculos.push({ el: obs, x: contenedor.clientWidth + 50 });
}
function quitarObstáculo(index) {
  const o = obstáculos[index];
  if (o) {
    if (o.el && o.el.parentNode) o.el.parentNode.removeChild(o.el);
    obstáculos.splice(index, 1);
  }
}


function hayColisión(rect1, rect2) {
  const inset = 25;
  return !(
    rect1.right - inset < rect2.left + inset ||
    rect1.left + inset > rect2.right - inset ||
    rect1.bottom - inset < rect2.top + inset ||
    rect1.top + inset > rect2.bottom - inset
  );
}

const sonidoGameOver = new Audio("audio/gameover.wav");

function gameOver() {
  juegoActivo = false;
  dyno.classList.remove("correr", "saltando");
  dyno.classList.add("estrellado");

  const staminaGanada = Math.floor(puntos / 2);
  const goldieGanada = Math.floor(puntos / 10);

 

  
  setTimeout(() => {
    finalScoreEl.textContent = `Puntuación: ${puntos}`;
    gameoverOverlay.style.display = "flex";
  }, 600);

  window.parent.postMessage({
    type: "recompensa",
    juego: "Reflejos del Dragón",
    staminaGanada,
    goldieGanada
  }, "*");

  console.log(`💀 Game Over — Puntos: ${puntos} | +${staminaGanada} Stamina | +${goldieGanada} Goldie`);
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaMs = timestamp - lastTime;
  const delta = deltaMs / 1000;
  lastTime = timestamp;

  if (juegoActivo) {
    
    sueloX -= speed * delta;
    const larguraCont = contenedor.clientWidth;
    if (Math.abs(sueloX) >= larguraCont) sueloX += larguraCont;
    suelo.style.transform = `translateX(${sueloX}px)`;

    
    if (!enSuelo) {
      velocidadY -= GRAVEDAD * delta;
      let bottom = parseFloat(dyno.style.bottom) || 22;
      bottom += velocidadY * delta;
      if (bottom <= -10) {
        bottom = -10;
        velocidadY = 0;
        enSuelo = true;
        dyno.classList.remove('saltando');
        dyno.classList.add('correr');
      }
      dyno.style.bottom = `${bottom}px`;
    }

    
    spawnTimer += deltaMs;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnInterval = 900 + Math.random() * 1100;
      crearObstáculo();
    }


    for (let i = obstáculos.length - 1; i >= 0; i--) {
      const o = obstáculos[i];
      o.x -= speed * delta;
      o.el.style.transform = `translateX(${o.x - contenedor.clientWidth}px)`;

      if (o.x < -100) {
        quitarObstáculo(i);
        puntos++;
        scoreEl.textContent = puntos;
        if (puntos % 5 === 0) speed += 30;
        continue;
      }

      const rectD = dyno.getBoundingClientRect();
      const rectO = o.el.getBoundingClientRect();
      if (hayColisión(rectD, rectO)) {
        gameOver();
        break;
      }
    }
  }

  requestAnimationFrame(loop);
}

// window.addEventListener('load', init);

const gameoverOverlay = document.getElementById("gameover");
const finalScoreEl = document.getElementById("final-score");



function reiniciar() {
 
  puntos = 0;
  speed = 300;
  sueloX = 0;
  obstáculos.forEach(o => o.el.remove());
  obstáculos = [];
  dyno.style.bottom = "-10px";
  dyno.className = "dyno correr";
  scoreEl.textContent = puntos;
  juegoActivo = true;
  lastTime = null;


  gameoverOverlay.style.display = "none";
  requestAnimationFrame(loop);
}


document.addEventListener('DOMContentLoaded', () => {
  const btnSaltar = document.getElementById('btnSaltar');
  if (btnSaltar) {
    btnSaltar.addEventListener('click', () => {
      if (juegoActivo) saltar();
    });
  }
});
