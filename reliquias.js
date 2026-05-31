
let numeros = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8];
numeros = numeros.sort(() => Math.random() - 0.5); 

let tarjetasDestapadas = 0;
let tarjeta1 = null;
let tarjeta2 = null;
let primerResultado = null;
let segundoResultado = null;
let movimientos = 0;
let aciertos = 0;
let temporizador = false;
let timer = 30;
let timerInicial = 30;
let tiempoRegresivo = null;


let mostrarMovimientos = document.getElementById("movimientos");
let mostrarAciertos = document.getElementById("aciertos");
let mostrarTiempo = document.getElementById("t-restante");
  const sonidoGanar= new Audio("audio/win.wav");

// =======================
// Funciones
// =======================
function destapar(id) {
  if (temporizador === false) {
    contarTiempo();
    temporizador = true;
  }

  tarjetasDestapadas++;

  if (tarjetasDestapadas === 1) {
  
    tarjeta1 = document.getElementById(id);
    primerResultado = numeros[id];
    tarjeta1.innerHTML = `<img src="./assets/${primerResultado}.png" alt="">`;
    tarjeta1.disabled = true;

  } else if (tarjetasDestapadas === 2) {
   
    tarjeta2 = document.getElementById(id);
    segundoResultado = numeros[id];
    tarjeta2.innerHTML = `<img src="./assets/${segundoResultado}.png" alt="">`;
    tarjeta2.disabled = true;

      
    movimientos++;
    mostrarMovimientos.innerHTML = `Movimientos: ${movimientos}`;

    if (primerResultado === segundoResultado) {
     
      tarjetasDestapadas = 0;

      aciertos++;
      mostrarAciertos.innerHTML = `Aciertos: ${aciertos}`;

      if (aciertos === 8) {
        clearInterval(tiempoRegresivo);
        mostrarAciertos.innerHTML = `Aciertos: ${aciertos} 😱`;
        mostrarMovimientos.innerHTML = `Movimientos: ${movimientos} 😎`;
        mostrarTiempo.innerHTML = `Fantástico 🎉 solo tardaste ${
          timerInicial - timer
        } segundos`;
        sonidoGanar.play();

        const staminaGanada = 3; 
        const goldieGanada = 1;

        window.parent.postMessage({
    type: "recompensa",
    juego: "Encuentra las Reliquias",
    staminaGanada,
    goldieGanada
  }, "*");
      }

    } else {
      
      setTimeout(() => {
        tarjeta1.innerHTML = "";
        tarjeta2.innerHTML = "";
        tarjeta1.disabled = false;
        tarjeta2.disabled = false;
        tarjetasDestapadas = 0;
      }, 800);
    }
  }
}

// =======================
// Temporizador
// =======================
function contarTiempo() {
  tiempoRegresivo = setInterval(() => {
    timer--;
    mostrarTiempo.innerHTML = `Tiempo: ${timer} segundos`;

    if (timer === 0) {
      clearInterval(tiempoRegresivo);
      bloquearTarjetas();
    }
  }, 1000);
}

function bloquearTarjetas() {
  for (let i = 0; i < 16; i++) {
    let tarjetaBloqueada = document.getElementById(i);
    tarjetaBloqueada.innerHTML = `<img src="./assets/${numeros[i]}.png" alt="">`
    tarjetaBloqueada.disabled = true;
  }
}
