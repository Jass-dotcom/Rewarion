var Stamina = 0;
var EnemigosRest = 7;
var GoldieGanado = 0;

function ganarStamina(){
    window.location.href = "Stamina.html"; ;
}
window.onload = function() {
document.getElementById("staminaValor").innerHTML = Stamina;
document.getElementById("enemigosValor").innerHTML = EnemigosRest;
document.getElementById("goldieValor").innerHTML = GoldieGanado;
}
