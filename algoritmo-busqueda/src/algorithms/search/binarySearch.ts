import type { SearchStep, SearchConfig, SearchResult, ElementSnapshot } from '../../types';

export function binarySearch(config: SearchConfig): SearchResult {
  const { array, target } = config;
  const steps: SearchStep[] = [];
  let foundIndex = -1;

  // Paso inicial
  steps.push({
    array: array.map((value): ElementSnapshot => ({ value, state: 'idle' })),
    pointers: {},
    description: 'Inicio: arreglo ordenado listo para búsqueda binaria',
    found: null,
    stepIndex: 0,
  });

  let inicio = 0;
  let fin = array.length - 1;

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);

    // mostrando rango activo y punto medio
    const snapshotComparando = array.map((valor, j): ElementSnapshot => {
      if (j < inicio || j > fin) return { value: valor, state: 'discarded' };
      if (j === medio) return { value: valor, state: 'comparing' };
      return { value: valor, state: 'inRange' };
    });

    steps.push({
      array: snapshotComparando,
      pointers: { 'L': inicio, 'R': fin, 'Mid': medio },
      description: `L=${inicio}, R=${fin}, Mid=${medio} → arr[${medio}] = ${array[medio]}`,
      found: null,
      stepIndex: steps.length,
    });

    const valorMedio = array[medio];

    if (valorMedio === undefined) {
      break;
    }

    if (valorMedio === target) {
      // encontrado
      foundIndex = medio;

      const snapshotMatch = array.map((valor, j): ElementSnapshot => {
        if (j === medio) return { value: valor, state: 'match' };
        if (j < inicio || j > fin) return { value: valor, state: 'discarded' };
        return { value: valor, state: 'inRange' };
      });

      steps.push({
        array: snapshotMatch,
        pointers: { 'L': inicio, 'R': fin, 'Mid': medio },
        description: `Encontrado! arr[${medio}] = ${target}`,
        found: true,
        stepIndex: steps.length,
      });

      return { steps, foundIndex, config };
    }

    if (valorMedio < target) {
      // descartar mitad izquierda
      steps.push({
        array: array.map((valor, j): ElementSnapshot => {
          if (j <= medio) return { value: valor, state: 'discarded' };
          if (j > fin) return { value: valor, state: 'discarded' };
          return { value: valor, state: 'inRange' };
        }),
        pointers: { 'L': medio + 1, 'R': fin, 'Mid': -1 },
        description: `${valorMedio} < ${target} → descartamos izquierda, nuevo L = ${medio + 1}`,
        found: null,
        stepIndex: steps.length,
      });
      inicio = medio + 1;
    } else {
      // descartar mitad derecha
      steps.push({
        array: array.map((valor, j): ElementSnapshot => {
          if (j < inicio) return { value: valor, state: 'discarded' };
          if (j >= medio) return { value: valor, state: 'discarded' };
          return { value: valor, state: 'inRange' };
        }),
        pointers: { 'L': inicio, 'R': medio - 1, 'Mid': -1 },
        description: `${valorMedio} > ${target} → descartamos derecha, nuevo R = ${medio - 1}`,
        found: null,
        stepIndex: steps.length,
      });
      fin = medio - 1;
    }
  }

  // no encontrado
  steps.push({
    array: array.map((valor): ElementSnapshot => ({ value: valor, state: 'discarded' })),
    pointers: {},
    description: `Elemento ${target} no encontrado (L > R, rango vacío)`,
    found: false,
    stepIndex: steps.length,
  });

  return { steps, foundIndex, config };
}
