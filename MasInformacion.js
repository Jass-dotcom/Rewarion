const botonfaq = document.querySelector(".btn-negro");
const botoncontactanos = document.querySelector(".btn-gris");

function faq() {
  window.location.href = "faq.html"; 
}

function contactanos() {
  window.location.href = "contacto.html"; 
}
botonfaq.addEventListener("click", faq);
botoncontactanos.addEventListener("click", contactanos);


