function showNotification() {
  alert("🔔 Tienes nuevas notificaciones del Mundial 🎉⚽");
}

//TORNEOS*******************************************************************************************************************************************
//este codigo tendra que ser modificado cuando ya tengamos la logica del juego. recorar esto
let fase = 1;
let historial = [];
let equipoSeleccionado = "";
let rival = "";

function iniciarSimulacion() {
  equipoSeleccionado = document.getElementById("equipoSelect").value;
  rival = "Alemania"; // Rival esta fijo para el ejemplo fijo 

  mostrarPaso(2);
  document.getElementById("teamA").innerText = equipoSeleccionado;
  document.getElementById("teamB").innerText = rival;

  setTimeout(() => {
    mostrarResultado();
  }, 2000); // suspenso de 2s
}

function mostrarResultado() {
  mostrarPaso(3);
  let golesA = Math.floor(Math.random() * 4);
  let golesB = Math.floor(Math.random() * 4);

  document.getElementById("resultadoA").innerText = `${equipoSeleccionado} ${golesA}`;
  document.getElementById("resultadoB").innerText = `${rival} ${golesB}`;

  let mensaje = "";
  if (golesA > golesB) {
    mensaje = `${equipoSeleccionado} avanza a la siguiente fase 🎉`;
    historial.push(`${equipoSeleccionado} ${golesA} - ${golesB} ${rival} ✅`);
    document.getElementById("btnSiguiente").style.display = "inline-block";
  } else {
    mensaje = `${equipoSeleccionado} ha sido eliminado 😢`;
    historial.push(`${equipoSeleccionado} ${golesA} - ${golesB} ${rival} ❌`);
    document.getElementById("btnSiguiente").style.display = "none";
    setTimeout(() => mostrarResultadosGenerales(), 2000);
  }

  document.getElementById("mensajeResultado").innerText = mensaje;
}

function siguienteFase() {
  rival = "Brasil"; // Rival de prueba
  mostrarPaso(2);
  document.getElementById("teamA").innerText = equipoSeleccionado;
  document.getElementById("teamB").innerText = rival;

  setTimeout(() => {
    mostrarResultado();
  }, 2000);
}

function mostrarResultadosGenerales() {
  mostrarPaso(4);
  let lista = document.getElementById("historial");
  lista.innerHTML = "";
  historial.forEach(partido => {
    let li = document.createElement("li");
    li.innerText = partido;
    lista.appendChild(li);
  });
}

function mostrarRecompensas() {
  mostrarPaso(5);
}

function reiniciarTorneo() {
  fase = 1;
  historial = [];
  mostrarPaso(1);
}

function mostrarPaso(num) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step" + num).classList.remove("hidden");
}

//TAREAS*****************************************************************************************************************************************************
function markDone(button) {
  let post = button.parentElement;
  post.classList.add("completed");
  post.querySelector("small").textContent = "Estado: ✅ Completada";
  button.remove();
}

