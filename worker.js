self.onmessage = function (e) {

    const { algoritmo, datos, objetivo } = e.data;
    const inicio = performance.now();
    let resultado = null;

    // ordenamientos
    function quick_sort(arr) {
        if (arr.length <= 1) return arr;

        const pivote = arr[arr.length - 1];
        const menores = [];
        const mayores = [];

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] <= pivote) menores.push(arr[i]);
            else mayores.push(arr[i]);
        }

        return [...quick_sort(menores), pivote, ...quick_sort(mayores)];
    }

    function insercion(arr) {
        for (let i = 1; i < arr.length; i++) {
            let valor = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j] > valor) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = valor;
        }
        return arr;
    }

    function burbuja(arr) {
        let n = arr.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    function busqueda_secuencial(arr, x) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === x) return i;
        }
        return -1;
    }

    function busqueda_binaria(arr, x) {
        let inicio = 0;
        let fin = arr.length - 1;

        while (inicio <= fin) {
            const medio = Math.floor((inicio + fin) / 2);

            if (arr[medio] === x) return medio;
            if (arr[medio] < x) inicio = medio + 1;
            else fin = medio - 1;
        }
        return -1;
    }

    let salida = null;

    if (algoritmo === "Quick Sort") salida = quick_sort(datos);
    else if (algoritmo === "Insertion Sort") salida = insercion(datos);
    else if (algoritmo === "Bubble Sort") salida = burbuja(datos);

    else if (algoritmo === "Busqueda Secuencial") {
        resultado = busqueda_secuencial(datos, objetivo);
    }
    else if (algoritmo === "Busqueda Binaria") {
        resultado = busqueda_binaria(datos, objetivo);
    }

    const fin = performance.now();

    //calculo de memoria usada por el arreglo
    const memoria_kb = (datos.length * 8 / 1024).toFixed(2);

    // respuesta al proceso principal
    self.postMessage({
        tiempo: (fin - inicio).toFixed(2),
        encontrado: resultado,
        memoria: memoria_kb
    });
};
