let baseArray = [];
let sortedArray = [];

const algorithms = [
    { name: "Quick Sort", id: "quick", complexity: "O(n log n)" },
    { name: "Insertion Sort", id: "insert", complexity: "O(n²)" },
    { name: "Bubble Sort", id: "bubble", complexity: "O(n²)" }
];

function $(id) {
    return document.getElementById(id);
}

/* ---------------------------
   CREAR TABLA DE RESULTADOS
----------------------------*/
function initTable() {
    const tbody = $("sortBody");
    tbody.innerHTML = "";

    algorithms.forEach(a => {
        tbody.innerHTML += `
            <tr id="row-${a.id}">
                <td><strong>${a.name}</strong></td>
                <td class="status">Esperando...</td>
                <td class="time">---</td>
                <td>${a.complexity}</td>
                <td class="mem">---</td>
            </tr>`;
    });
}

/* ---------------------------
   GENERAR ARREGLO
----------------------------*/
function generateArray() {
    const size = parseInt($("arraySize").value);

    baseArray = Array.from({ length: size }, () => Math.floor(Math.random() * size * 2));

    $("btnSort").disabled = false;
    $("statusText").innerText = `Arreglo generado con ${size} elementos.`;
    $("targetVal").value = baseArray[Math.floor(Math.random() * size)];

    sortedArray = [];
    initTable();
}

/* ---------------------------
   CARRERA DE ORDENAMIENTO
----------------------------*/
function startSortRace() {
    $("btnSort").disabled = true;
    let finished = 0;
    let results = [];

    algorithms.forEach(a => {
        const worker = new Worker("worker.js");

        worker.postMessage({ algorithm: a.name, data: [...baseArray] });

        const row = $("row-" + a.id);
        row.querySelector(".status").innerText = "Procesando...";
        row.querySelector(".status").classList.add("status-running");

        worker.onmessage = (e) => {
            row.querySelector(".status").innerText = "Finalizado";
            row.querySelector(".status").classList.remove("status-running");
            row.querySelector(".status").classList.add("status-finished");

            row.querySelector(".time").innerText = `${e.data.time} ms`;
            row.querySelector(".mem").innerText = `${e.data.memory} KB`;

            results.push({ name: a.name, time: parseFloat(e.data.time) });

            if (a.name === "Quick Sort") {
                sortedArray = [...baseArray].sort((x, y) => x - y);
            }

            finished++;
            if (finished === algorithms.length) {
                showWinner(results);
                $("btnSearch").disabled = false;
                showProcessMemory();   // ← MEMORIA TOTAL DEL PROCESO
            }

            worker.terminate();
        };
    });
}

/* ---------------------------
   DETERMINAR GANADOR
----------------------------*/
function showWinner(results) {
    const winner = results.reduce((a, b) => a.time < b.time ? a : b);
    $("sortWinner").innerText = `🏆 Ganó: ${winner.name} (${winner.time} ms)`;
}

/* ---------------------------
   BÚSQUEDAS
----------------------------*/
function startSearchRace() {
    const target = parseInt($("targetVal").value);

    // SEC
    const w1 = new Worker("worker.js");
    w1.postMessage({ algorithm: "Búsqueda Secuencial", data: baseArray, target });

    $("resSeq").innerText = "Buscando...";

    w1.onmessage = (e) => {
        $("resSeq").innerText = e.data.found;
        $("timeSeq").innerText = `${e.data.time} ms`;
        w1.terminate();
    };

    // BIN (con array ordenado)
    if (sortedArray.length === 0) sortedArray = [...baseArray].sort((a, b) => a - b);

    const w2 = new Worker("worker.js");
    w2.postMessage({ algorithm: "Búsqueda Binaria", data: sortedArray, target });

    $("resBin").innerText = "Buscando...";

    w2.onmessage = (e) => {
        $("resBin").innerText = e.data.found;
        $("timeBin").innerText = `${e.data.time} ms`;
        w2.terminate();
    };
}

/* ---------------------------
   MEMORIA TOTAL DEL PROCESO
----------------------------*/
function showProcessMemory() {
    if (!performance.memory) {
        console.warn("Memoria no disponible en este navegador");
        return;
    }

    const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

    console.log("🔹 Memoria usada:", used + " MB");
    console.log("🔹 Heap total:", total + " MB");
    console.log("🔹 Límite:", limit + " MB");

    const p = document.createElement("p");
    p.style.textAlign = "center";
    p.style.marginTop = "10px";
    p.innerHTML = `
        <strong>Memoria total del Proceso:</strong><br>
        Usada: ${used} MB<br>
        Heap total: ${total} MB<br>
        Límite: ${limit} MB
    `;
    document.body.appendChild(p);
}

/* ---------------------------
   INICIALIZAR TABLA
----------------------------*/
initTable();
