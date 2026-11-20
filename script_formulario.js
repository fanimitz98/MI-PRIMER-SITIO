// CAMPOS DE NOMBRES Y APELLIDOS
// Siempre en MAYÚSCULAS, sin números ni signos especiales

const nombres = ["nombre", "paterno", "materno"];

nombres.forEach(id => {

    const campo = document.getElementById(id);

    campo.addEventListener("input", () => {

        campo.value = campo.value
            .toLocaleUpperCase("es-MX")
            .replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, "")   // quita números y signos
            .replace(/^ +/, "")               // sin espacio al inicio
            .replace(/ {2,}/g, " ");          // sin espacios dobles

        validarNombre(id);

    });

});


// FUNCIÓN PARA MOSTRAR VALIDACIONES

function mostrar(id, correcto, mensaje) {

    const campo = document.getElementById(id);

    const estado = document.getElementById("estado" +
        id.charAt(0).toUpperCase() + id.slice(1));

    const texto = document.getElementById("msg" +
        id.charAt(0).toUpperCase() + id.slice(1));

    campo.classList.remove("valido", "invalido");

    estado.className = "estado";

    texto.className = "";

    if (correcto) {

        campo.classList.add("valido");

        estado.textContent = "✓";
        estado.classList.add("exito");

        texto.textContent = mensaje;
        texto.classList.add("exito");

    } else {

        campo.classList.add("invalido");

        estado.textContent = "✕";
        estado.classList.add("error");

        texto.textContent = mensaje;
        texto.classList.add("error");

    }

}


// VALIDAR NOMBRE Y APELLIDOS (solo letras y que tenga al menos una vocal)

function validarNombre(id) {

    const valor = document.getElementById(id).value.trim();

    const soloLetras = /^[A-ZÁÉÍÓÚÜÑ]+(?: [A-ZÁÉÍÓÚÜÑ]+)?$/.test(valor);
    const tieneVocal = /[AEIOUÁÉÍÓÚÜ]/.test(valor);

    const correcto = soloLetras && tieneVocal;

    let mensaje = "Nombre correcto";

    if (!soloLetras) {
        mensaje = "Solo se permiten letras";
    } else if (!tieneVocal) {
        mensaje = "Debe contener al menos una vocal";
    }

    mostrar(id, correcto, mensaje);

    return correcto;
}


// CORREO ELECTRÓNICO
// Dominios que cierran el correo: no deja escribir nada después

const DOMINIO_COMPLETO = new RegExp(
    "@(?:(?:gmail|hotmail|outlook|yahoo|live|icloud)\\.com" +
    "|[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:gov|gob|edu|org|com)\\.mx)"
);

document.getElementById("correo").addEventListener("input", function() {

    let v = this.value
        .toLowerCase()
        .replace(/[^a-z0-9@._%+-]/g, "");   // sin espacios ni otros signos

    // solo una arroba
    const i = v.indexOf("@");
    if (i !== -1) {
        v = v.slice(0, i + 1) + v.slice(i + 1).replace(/@/g, "");
    }

    // si ya está completo el dominio, corta lo que sobre
    const m = DOMINIO_COMPLETO.exec(v);
    if (m) {
        v = v.slice(0, m.index + m[0].length);
    }

    this.value = v;

    validarCorreo();

});

function validarCorreo() {

    const valor = document.getElementById("correo").value.trim();

    const patron = new RegExp(
        "^[a-z0-9._%+-]+" + DOMINIO_COMPLETO.source + "$"
    );

    const correcto = patron.test(valor);

    mostrar(
        "correo",
        correcto,
        correcto
            ? "Correo válido"
            : "Ejemplos: nombre@gmail.com, nombre@hotmail.com, nombre@dependencia.gob.mx"
    );

    return correcto;
}


// VALIDAR EDAD (máximo 3 números)

document.getElementById("edad").addEventListener("input", function() {

    this.value = this.value.replace(/\D/g, "").slice(0, 3);

    validarEdad();

});

function validarEdad() {

    const valor = document.getElementById("edad").value;

    const correcto = /^\d{1,3}$/.test(valor);

    mostrar(
        "edad",
        correcto,
        correcto ? "Edad válida" : "Máximo 3 números"
    );

    return correcto;
}


// VALIDAR NÚMERO DE TELÉFONO (10 números)

document.getElementById("telefono").addEventListener("input", function() {

    this.value = this.value.replace(/\D/g, "").slice(0, 10);

    validarTelefono();

});

function validarTelefono() {

    const valor = document.getElementById("telefono").value;

    const correcto = /^\d{10}$/.test(valor);

    mostrar(
        "telefono",
        correcto,
        correcto ? "Teléfono válido" : "Debe tener exactamente 10 números"
    );

    return correcto;
}


// VALIDAR NÚMERO DE TARJETA (16 números)
// Requiere en el HTML: id="tarjeta", id="estadoTarjeta" e id="msgTarjeta"

document.getElementById("tarjeta").addEventListener("input", function() {

    this.value = this.value.replace(/\D/g, "").slice(0, 16);

    validarTarjeta();

});

function validarTarjeta() {

    const valor = document.getElementById("tarjeta").value;

    const correcto = /^\d{16}$/.test(valor);

    mostrar(
        "tarjeta",
        correcto,
        correcto ? "Tarjeta válida" : "Debe tener exactamente 16 números"
    );

    return correcto;
}


// VALIDAR TODO EL FORMULARIO

document.getElementById("formulario").addEventListener("submit", function(e) {

    e.preventDefault();

    const resultados = [

        validarNombre("nombre"),
        validarNombre("paterno"),
        validarNombre("materno"),
        validarEdad(),
        validarCorreo(),
        validarTelefono(),
        validarTarjeta()

    ];

    const resultado = document.getElementById("resultado");

    if (resultados.every(Boolean)) {

        resultado.textContent = "✓ ¡Formulario validado correctamente!";

        resultado.className = "exito";

    } else {

        resultado.textContent = "✕ Revisa los campos marcados en rojo.";

        resultado.className = "error";

    }

});
