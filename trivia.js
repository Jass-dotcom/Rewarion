import { preguntasYRespuestas } from "./preguntas-y-respuestas.js";

const contenedorPregunta = document.getElementById('contenedor-pregunta');
const contenedorOpciones = document.getElementById('contenedor-opciones');
const resultadoTrivia = document.getElementById('resultado-trivia');
const resultadoTexto = document.getElementById('resultado-texto');

let preguntasActuales = [];
let indicePregunta = 0;
let aciertos = 0;
const sonidoGanar = new Audio("audio/win.wav");

// (algoritmo de Fisher-Yates)
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function iniciarJuego() {
  preguntasActuales = [];
  indicePregunta = 0;
  aciertos = 0;
  resultadoTrivia.style.display = 'none';
  mostrarSeleccionTema();
}

function mostrarSeleccionTema() {
  contenedorPregunta.innerHTML = '<h2>Selecciona un tema</h2>';
  contenedorOpciones.innerHTML = '';

  Object.keys(preguntasYRespuestas).forEach(tema => {
    const opcion = document.createElement('p');
    opcion.className = 'opcion';
    opcion.textContent = tema.charAt(0).toUpperCase() + tema.slice(1);
    opcion.onclick = () => seleccionarTema(tema);
    contenedorOpciones.appendChild(opcion);
  });
}

function seleccionarTema(tema) {
  
  preguntasActuales = mezclarArray([...preguntasYRespuestas[tema]]);
  indicePregunta = 0;
  mostrarPreguntaActual();
}

function mostrarPreguntaActual() {
  if (indicePregunta >= preguntasActuales.length) {
    mostrarResultadoFinal();
    return;
  }

  const preguntaData = preguntasActuales[indicePregunta];
  contenedorPregunta.innerHTML = `<h2>${preguntaData.pregunta}</h2>`;
  contenedorOpciones.innerHTML = '';

  
  const opcionesMezcladas = mezclarArray([...preguntaData.opciones]);

  opcionesMezcladas.forEach(opcionTexto => {
    const opcion = document.createElement('p');
    opcion.className = 'opcion';
    opcion.textContent = opcionTexto;
    opcion.onclick = (e) => manejarRespuesta(e.target, opcionTexto, preguntaData.respuesta);
    contenedorOpciones.appendChild(opcion);
  });
}

function manejarRespuesta(elementoClicado, respuestaSeleccionada, respuestaCorrecta) {
  Array.from(contenedorOpciones.children).forEach(op => op.onclick = null);

  if (respuestaSeleccionada === respuestaCorrecta) {
    aciertos++;
    elementoClicado.classList.add('acierto');
  } else {
    elementoClicado.classList.add('error');
    Array.from(contenedorOpciones.children).forEach(op => {
      if (op.textContent === respuestaCorrecta) {
        op.classList.add('acierto');
      }
    });
  }

  setTimeout(() => {
    indicePregunta++;
    mostrarPreguntaActual();
  }, 1000);
}

function mostrarResultadoFinal() {
  const totalPreguntas = preguntasActuales.length;
  resultadoTexto.textContent = `Has acertado ${aciertos} de ${totalPreguntas} preguntas`;

  if (aciertos === totalPreguntas) {
    sonidoGanar.play();
    const staminaGanada = 2;
    const goldieGanada = 0;

    window.parent.postMessage({
      type: "recompensa",
      juego: "Desafío del Saber",
      staminaGanada,
      goldieGanada
    }, "*");
  }

  resultadoTrivia.style.display = 'flex';
}

window.iniciarJuego = iniciarJuego;
window.addEventListener('load', iniciarJuego);
