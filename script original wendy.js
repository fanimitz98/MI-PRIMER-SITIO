const formulario = document.getElementById("formulario");
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

// Mostrar palomita o X
function mostrarEstado(id, valido) {
  const estado = document.getElementById("estado-" + id);
  estado.textContent = valido ? "✓" : "✗";
  estado.className = valido ? "estado correcto" : "estado incorrecto";
}

// Filtros mientras escribe (todo en mayúsculas)
const filtros = {
  nombre:   v => v.replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, ""),
  paterno:  v => v.replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, ""),
  materno:  v => v.replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, ""),
  edad:     v => v.replace(/\D/g, "").slice(0, 3),
  telefono: v => v.replace(/\D/g, "").slice(0, 10),
  tarjeta:  v => v.replace(/\D/g, "").slice(0, 16),
  correo:   v => v,
  fecha:    v => v
};

Object.keys(campos).forEach(id => {
  campos[id].addEventListener("input", () => {
    const limpio = filtros[id](campos[id].value.toUpperCase());
    campos[id].value = limpio;
  });
});

// Validaciones
function validarNombre(id) {
  const valido = /^[A-ZÁÉÍÓÚÜÑ]+( [A-ZÁÉÍÓÚÜÑ]+)*$/.test(campos[id].value.trim());
  mostrarEstado(id, valido);
  return valido;
}

function validarEdad() {
  const valido = /^[0-9]{1,3}$/.test(campos.edad.value);
  mostrarEstado("edad", valido);
  return valido;
}

function validarFecha() {
  const valor = campos.fecha.value;
  const valido = valor !== "" && !Number.isNaN(Date.parse(valor));
  mostrarEstado("fecha", valido);
  return valido;
}

function validarTelefono() {
  const valido = /^[0-9]{10}$/.test(campos.telefono.value);
  mostrarEstado("telefono", valido);
  return valido;
}

function validarCorreo() {
  const valido = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(campos.correo.value.trim());
  mostrarEstado("correo", valido);
  return valido;
}

function validarTarjeta() {
  const valido = /^[0-9]{16}$/.test(campos.tarjeta.value);
  mostrarEstado("tarjeta", valido);
  return valido;
}

// Envío
formulario.addEventListener("submit", e => {
  e.preventDefault();

  const resultados = {
    nombre: validarNombre("nombre"),
    paterno: validarNombre("paterno"),
    materno: validarNombre("materno"),
    edad: validarEdad(),
    fecha: validarFecha(),
    telefono: validarTelefono(),
    correo: validarCorreo(),
    tarjeta: validarTarjeta()
  };

  if (Object.values(resultados).every(v => v)) {
    mensaje.textContent = "Formulario validado";
    mensaje.style.color = "green";
  } else {
    mensaje.textContent = "Revisa los campos marcados con ✗";
    mensaje.style.color = "red";
  }
});