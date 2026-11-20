/* =====================================================
   script.js: sirve para index.html y para el formulario
   ===================================================== */

/* ---------- Insignia de plan (arriba a la derecha) ----------
   "Público" por defecto, "Premium" tras suscribirse.
   No se guarda nada: al recargar en Chrome vuelve a "Público". */
(function () {
  const insignia = document.createElement("div");
  insignia.id = "plan-insignia";
  insignia.style.cssText =
    "position:fixed;top:14px;right:18px;z-index:1000;padding:8px 18px;" +
    "border-radius:30px;font:bold 0.95rem sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.35);" +
    "transition:all .3s;";
  document.body.appendChild(insignia);

  function actualizarPlan(plan) {
    if (plan === "premium") {
      insignia.textContent = "⭐ Premium";
      insignia.style.background = "linear-gradient(135deg,#f9d423,#ff8c00)";
      insignia.style.color = "#000";
    } else {
      insignia.textContent = "🌐 Público";
      insignia.style.background = "#e0e0e0";
      insignia.style.color = "#333";
    }
  }
  window.actualizarPlan = actualizarPlan;

  // Si llegas desde el formulario ya suscrito, muestra Premium una sola vez
  // y limpia la dirección para que al recargar vuelva a "Público".
  const params = new URLSearchParams(window.location.search);
  if (params.get("plan") === "premium") {
    actualizarPlan("premium");
    history.replaceState(null, "", window.location.pathname);
  } else {
    actualizarPlan("publico");
  }
})();

/* ---------- Formulario (solo corre si la página lo tiene) ---------- */
(function () {
const formulario = document.getElementById("miFormulario");
if (!formulario) return; // en index.html no hay formulario

const mensaje = document.getElementById("mensaje");

const campos = {
  nombre: document.getElementById("nombre"),
  paterno: document.getElementById("paterno"),
  materno: document.getElementById("materno"),
  edad: document.getElementById("edad"),
  fecha: document.getElementById("fecha"),
  telefono: document.getElementById("telefono"),
  correo: document.getElementById("correo"),
  tarjeta: document.getElementById("tarjeta")
};

const MAX_NOMBRE = 100;
const MAYORIA_EDAD = 18;

/* ---------- Mensajes de error debajo de cada campo ---------- */
function obtenerMensajeError(id) {
  const campo = campos[id].closest(".campo") || campos[id].parentElement;
  let el = campo.querySelector(".error");
  if (!el) {
    el = document.createElement("small");
    el.className = "error";
    campo.appendChild(el);
  }
  return el;
}

function obtenerEstado(id) {
  const caja = campos[id].closest(".entrada") || campos[id].parentElement;
  return caja.querySelector(".estado");
}

// Mostrar palomita o X (con texto de error opcional)
function mostrarEstado(id, valido, texto = "") {
  const estado = obtenerEstado(id);
  if (estado) {
    estado.textContent = valido ? "✓" : "✗";
    estado.className = valido ? "estado correcto" : "estado incorrecto";
  }
  obtenerMensajeError(id).textContent = valido ? "" : texto;
}

// Aviso temporal cuando intenta escribir algo no permitido
const temporizadores = {};
function avisoTemporal(id, texto) {
  const el = obtenerMensajeError(id);
  el.textContent = texto;
  clearTimeout(temporizadores[id]);
  temporizadores[id] = setTimeout(() => {
    if (el.textContent === texto) el.textContent = "";
  }, 2000);
}

/* ---------- Filtros mientras escribe ---------- */
const soloLetras = v => v.replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, "").slice(0, MAX_NOMBRE);

// Correo: en cuanto el dominio termina en una extensión válida, ya no deja escribir más.
// Acepta cualquier proveedor (gmail, hotmail, outlook...) y extensiones
// .com, .mx, .org, .net, .edu, .gob.mx, .com.mx, .org.mx, .edu.mx
function filtrarCorreo(v) {
  v = v.replace(/\s/g, "").toLowerCase();
  const m = v.match(
    /^[a-z0-9._%+-]+@[a-z0-9-]+(?:\.(?:com|org|edu)(?:\.mx)?|\.gob\.mx|\.mx|\.net)/
  );
  if (!m) return v;
  const resto = v.slice(m[0].length);
  // Permite seguir escribiendo ".mx" después de .com / .org / .edu
  if (/\.(com|org|edu)$/.test(m[0]) && ".mx".startsWith(resto)) return m[0] + resto;
  return m[0];
}

const filtros = {
  nombre: soloLetras,
  paterno: soloLetras,
  materno: soloLetras,
  edad: v => v.replace(/\D/g, "").slice(0, 3),
  telefono: v => v.replace(/\D/g, "").slice(0, 10),
  tarjeta: v => v.replace(/\D/g, "").slice(0, 16),
  correo: filtrarCorreo,
  fecha: v => v
};

const avisosFiltro = {
  nombre: "Solo se aceptan letras",
  paterno: "Solo se aceptan letras",
  materno: "Solo se aceptan letras",
  edad: "Solo se aceptan números",
  telefono: "Solo se aceptan números",
  tarjeta: "Solo se aceptan números"
};

/* ---------- Validaciones ---------- */
function validarNombre(id) {
  const valor = campos[id].value.trim();
  if (valor === "") {
    mostrarEstado(id, false, "Este campo es obligatorio");
    return false;
  }
  if (!/^[A-ZÁÉÍÓÚÜÑ]+( [A-ZÁÉÍÓÚÜÑ]+)*$/.test(valor)) {
    mostrarEstado(id, false, "Solo letras, sin signos ni números");
    return false;
  }
  if (valor.length > MAX_NOMBRE) {
    mostrarEstado(id, false, "Máximo " + MAX_NOMBRE + " caracteres");
    return false;
  }
  if (!/[AEIOUÁÉÍÓÚÜ]/.test(valor)) {
    mostrarEstado(id, false, "Debe tener al menos una vocal (A, E, I, O, U)");
    return false;
  }
  mostrarEstado(id, true);
  return true;
}

function validarEdad() {
  const valor = campos.edad.value;
  if (!/^[0-9]{1,3}$/.test(valor)) {
    mostrarEstado("edad", false, "Solo se aceptan números (hasta 3 cifras)");
    return false;
  }
  if (Number(valor) > 120) {
    mostrarEstado("edad", false, "Escribe una edad válida");
    return false;
  }
  mostrarEstado("edad", true);
  return true;
}

// Calcula la edad a partir de "YYYY-MM-DD"
function calcularEdad(valor) {
  const [a, m, d] = valor.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - a;
  const cumpleYaPaso =
    hoy.getMonth() + 1 > m || (hoy.getMonth() + 1 === m && hoy.getDate() >= d);
  if (!cumpleYaPaso) edad--;
  return edad;
}

function validarFecha() {
  const valor = campos.fecha.value;
  if (valor === "" || Number.isNaN(Date.parse(valor))) {
    mostrarEstado("fecha", false, "Elige tu fecha de nacimiento");
    return false;
  }
  const edadReal = calcularEdad(valor);
  if (edadReal < 0) {
    mostrarEstado("fecha", false, "La fecha no puede ser futura");
    return false;
  }
  if (campos.edad.value !== "" && Number(campos.edad.value) !== edadReal) {
    mostrarEstado("fecha", false, "La fecha no coincide con tu edad (" + campos.edad.value + ")");
    return false;
  }
  mostrarEstado("fecha", true);
  return true;
}

function validarTelefono() {
  const valido = /^[0-9]{10}$/.test(campos.telefono.value);
  mostrarEstado("telefono", valido, "Debe tener exactamente 10 números");
  return valido;
}

function validarCorreo() {
  const valido = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z]{2,})+$/.test(campos.correo.value.trim());
  mostrarEstado("correo", valido, "Escribe un correo válido (ej. nombre@gmail.com)");
  return valido;
}

function validarTarjeta() {
  const edad = Number(campos.edad.value);
  if (campos.edad.value !== "" && edad < MAYORIA_EDAD) {
    mostrarEstado("tarjeta", false, "Un menor de edad no puede registrar una tarjeta");
    return false;
  }
  const valido = /^[0-9]{16}$/.test(campos.tarjeta.value);
  mostrarEstado("tarjeta", valido, "Debe tener 16 números");
  return valido;
}

const validadores = {
  nombre: () => validarNombre("nombre"),
  paterno: () => validarNombre("paterno"),
  materno: () => validarNombre("materno"),
  edad: validarEdad,
  fecha: validarFecha,
  telefono: validarTelefono,
  correo: validarCorreo,
  tarjeta: validarTarjeta
};

/* ---------- Eventos de escritura ---------- */
Object.keys(campos).forEach(id => {
  campos[id].addEventListener("input", () => {
    const original = campos[id].value;
    const base = id === "correo" ? original : original.toUpperCase();
    const limpio = filtros[id](base);
    campos[id].value = limpio;

    const huboCaracterInvalido = avisosFiltro[id] && limpio.length < base.length && base.length <= MAX_NOMBRE + 1;
    if (huboCaracterInvalido && !(["nombre", "paterno", "materno"].includes(id) && base.length > MAX_NOMBRE)) {
      avisoTemporal(id, avisosFiltro[id]);
      return;
    }

    if (["nombre", "paterno", "materno"].includes(id) && base.length > MAX_NOMBRE) {
      avisoTemporal(id, "Máximo " + MAX_NOMBRE + " caracteres");
      return;
    }

    // Validación en vivo cuando ya hay algo escrito
    if (limpio !== "") validadores[id]();

    // Edad, fecha y tarjeta dependen entre sí
    if (id === "edad") {
      if (campos.fecha.value) validarFecha();
      if (campos.tarjeta.value) validarTarjeta();
    }
    if (id === "fecha" && campos.edad.value) validarEdad();
  });
});

/* ---------- Pantalla de suscripción Premium ---------- */
function mostrarPantallaPremium() {
  if (window.actualizarPlan) window.actualizarPlan("premium");
  const capa = document.createElement("div");
  capa.style.cssText =
    "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;" +
    "justify-content:center;background:rgba(0,0,0,.85);padding:20px;";

  const tarjeta = document.createElement("div");
  tarjeta.style.cssText =
    "background:#121212;color:#fff;border-radius:16px;padding:40px 30px;" +
    "max-width:420px;width:100%;text-align:center;font-family:sans-serif;" +
    "box-shadow:0 10px 40px rgba(0,0,0,.6);";

  const titulo = document.createElement("h2");
  titulo.textContent = "🎵 ¡Te has suscrito a Premium correctamente!";
  titulo.style.cssText = "margin:0 0 12px;font-size:1.5rem;";

  const texto = document.createElement("p");
  texto.textContent = "Ya puedes disfrutar de toda tu música sin límites.";
  texto.style.cssText = "margin:0 0 28px;color:#b3b3b3;";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = "▶ Empezar a escuchar";
  boton.style.cssText =
    "background:#1db954;color:#000;border:none;border-radius:30px;" +
    "padding:14px 32px;font-size:1rem;font-weight:bold;cursor:pointer;";
  boton.addEventListener("click", () => {
    window.location.href = "index.html?plan=premium"; // cambia el nombre si tu página de inicio se llama distinto
  });

  tarjeta.append(titulo, texto, boton);
  capa.appendChild(tarjeta);
  document.body.appendChild(capa);
  boton.focus();
}

/* ---------- Envío ---------- */
formulario.addEventListener("submit", e => {
  e.preventDefault();

  // Se validan todos (sin cortar en el primero) para marcar todos los errores
  const resultados = Object.keys(validadores).map(id => validadores[id]());

  if (resultados.every(v => v)) {
    mensaje.textContent = "";
    mostrarPantallaPremium();
  } else {
    mensaje.textContent = "Revisa los campos marcados con ✗";
    mensaje.style.color = "red";
  }
});

})();
