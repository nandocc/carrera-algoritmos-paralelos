self.onmessage = function (e) {
    const { algorithm, data, target } = e.data;

    const start = performance.now();
    let result = null;

    /* ---------------------------
       ALGORITMOS DE ORDENAMIENTO
    ----------------------------*/
    function quickSort(arr) {
        if (arr.length <= 1) return arr;

        const pivot = arr[arr.length - 1];
        const left = [];
        const right = [];

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] <= pivot) left.push(arr[i]);
            else right.push(arr[i]);
        }
        return [...quickSort(left), pivot, ...quickSort(right)];
    }

    function insertionSort(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    function bubbleSort(arr) {
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    const tmp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tmp;
                }
            }
        }
        return arr;
    }

    /* ---------------------------
       ALGORITMOS DE BÚSQUEDA
    ----------------------------*/
    function sequentialSearch(arr, t) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === t) return i;
        }
        return -1;
    }

    function binarySearch(arr, t) {
        let low = 0;
        let high = arr.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);

            if (arr[mid] === t) return mid;
            if (arr[mid] < t) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    /* ---------------------------
       EJECUTAR ALGORITMO CORRESPONDIENTE
    ----------------------------*/
    let output = null;

    if (algorithm === "Quick Sort") output = quickSort(data);
    else if (algorithm === "Insertion Sort") output = insertionSort(data);
    else if (algorithm === "Bubble Sort") output = bubbleSort(data);

    else if (algorithm === "Búsqueda Secuencial") {
        result = sequentialSearch(data, target);
    }
    else if (algorithm === "Búsqueda Binaria") {
        result = binarySearch(data, target);
    }

    const end = performance.now();

    /* ---------------------------
       ESTIMACIÓN DE MEMORIA
    ----------------------------*/
    // Aproximación: cada número ocupa 8 bytes
    const estimatedMemoryKB = (data.length * 8 / 1024).toFixed(2);

    /* ---------------------------
       RESPUESTA AL MAIN THREAD
    ----------------------------*/
    self.postMessage({
        time: (end - start).toFixed(2),
        found: result,
        memory: estimatedMemoryKB
    });
};
