let arreglo_base = [];
let arreglo_ordenado = [];

const algoritmos = [
    { nombre: "Quick Sort", id: "quick", complejidad: "O(n log n)" },
    { nombre: "Insertion Sort", id: "insert", complejidad: "O(n²)" },
    { nombre: "Bubble Sort", id: "bubble", complejidad: "O(n²)" }
];

function $(id) {
    return document.getElementById(id);
}

// tabla que muestra los resultados 
function crear_tabla() {
    const cuerpo = $("tabla_orden");
    cuerpo.innerHTML = "";

    algoritmos.forEach(a => {
        cuerpo.innerHTML += `
            <tr id="fila-${a.id}">
                <td><strong>${a.nombre}</strong></td>
                <td class="estado">Esperando...</td>
                <td class="tiempo">---</td>
                <td>${a.complejidad}</td>
                <td class="memoria">---</td>
            </tr>
        `;
    });
}

// generar un arreglo aleatorio
function generar_arreglo() {
    const tam = parseInt($("tam_arreglo").value);

    arreglo_base = Array.from(
        { length: tam },
        () => Math.floor(Math.random() * tam * 2)
    );

    $("btn_ordenar").disabled = false;
    $("texto_estado").innerText = "Arreglo generado con " + tam + " elementos.";

    $("valor_busqueda").value = arreglo_base[Math.floor(Math.random() * tam)];
    arreglo_ordenado = [];

    crear_tabla();
}

function iniciar_carrera() {
    $("btn_ordenar").disabled = true;

    let terminados = 0;
    let resultados = [];

    algoritmos.forEach(a => {
        const worker = new Worker("worker.js");

        worker.postMessage({
            algoritmo: a.nombre,
            datos: [...arreglo_base]
        });

        const fila = $("fila-" + a.id);
        fila.querySelector(".estado").innerText = "Procesando...";
        fila.querySelector(".estado").classList.add("status-running");

        worker.onmessage = (e) => {
            fila.querySelector(".estado").innerText = "Finalizado";
            fila.querySelector(".estado").classList.remove("status-running");
            fila.querySelector(".estado").classList.add("status-finished");

            fila.querySelector(".tiempo").innerText = e.data.tiempo + " ms";
            fila.querySelector(".memoria").innerText = e.data.memoria + " KB";

            resultados.push({
                nombre: a.nombre,
                tiempo: parseFloat(e.data.tiempo)
            });

            if (a.nombre === "Quick Sort") {
                arreglo_ordenado = [...arreglo_base].sort((x, y) => x - y);
            }

            terminados++;
            if (terminados === algoritmos.length) {
                mostrar_ganador(resultados);
                $("btn_buscar").disabled = false;
                mostrar_memoria_proceso();
            }

            worker.terminate();
        };
    });
}

// mostrar ganador

function mostrar_ganador(resultados) {
    const ganador = resultados.reduce(
        (a, b) => (a.tiempo < b.tiempo ? a : b)
    );

    $("ganador_orden").innerText =
        "🏆 Gano: " + ganador.nombre + " (" + ganador.tiempo + " ms)";
}

// iniciar las busquedas

function iniciar_busquedas() {
    const objetivo = parseInt($("valor_busqueda").value);

    // busqueda secuencial
    $("resultado_sec").innerText = "Buscando...";

    const w1 = new Worker("worker.js");
    w1.postMessage({
        algoritmo: "Busqueda Secuencial",
        datos: arreglo_base,
        objetivo: objetivo
    });

    w1.onmessage = (e) => {
        $("resultado_sec").innerText = e.data.encontrado;
        $("tiempo_sec").innerText = e.data.tiempo + " ms";
        w1.terminate();
    };

    // busqueda binaria
    if (arreglo_ordenado.length === 0) {
        arreglo_ordenado = [...arreglo_base].sort((a, b) => a - b);
    }

    $("resultado_bin").innerText = "Buscando...";

    const w2 = new Worker("worker.js");
    w2.postMessage({
        algoritmo: "Busqueda Binaria",
        datos: arreglo_ordenado,
        objetivo: objetivo
    });

    w2.onmessage = (e) => {
        $("resultado_bin").innerText = e.data.encontrado;
        $("tiempo_bin").innerText = e.data.tiempo + " ms";
        w2.terminate();
    };
}

// memoria total del proceso
function mostrar_memoria_proceso() {
    if (!performance.memory) return;

    const usada = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limite = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

    const p = document.createElement("p");
    p.style.textAlign = "center";
    p.style.marginTop = "10px";

    p.innerHTML =
        "<strong>Memoria total del proceso:</strong><br>" +
        "Usada: " + usada + " MB<br>" +
        "Heap total: " + total + " MB<br>" +
        "Limite: " + limite + " MB";

    document.body.appendChild(p);
}


crear_tabla();
