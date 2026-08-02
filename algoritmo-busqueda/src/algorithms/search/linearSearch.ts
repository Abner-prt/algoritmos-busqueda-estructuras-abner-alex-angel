import type { SearchStep, SearchConfig, SearchResult, ElementSnapshot } from '../../types';

export function linearSearch(config: SearchConfig): SearchResult {
  const { array, target } = config;
  const steps: SearchStep[] = [];
  let foundIndex = -1;

  //  todo en idle
  steps.push(crearPaso(array, {}, 'Inicio: arreglo sin evaluar', null, 0));

  for (let i = 0; i < array.length; i++) {
    // comparando elemento actual
    const snapshotComparando = array.map((valor, j): ElementSnapshot => {
      if (j < i) return { value: valor, state: 'discarded' };
      if (j === i) return { value: valor, state: 'comparing' };
      return { value: valor, state: 'idle' };
    });

    steps.push({
      array: snapshotComparando,
      pointers: { 'i': i },
      description: `Comparando arr[${i}] = ${array[i]} con objetivo ${target}`,
      found: null,
      stepIndex: steps.length,
    });

    if (array[i] === target) {
      foundIndex = i;
      const snapshotMatch = array.map((valor, j): ElementSnapshot => {
        if (j < i) return { value: valor, state: 'discarded' };
        if (j === i) return { value: valor, state: 'match' };
        return { value: valor, state: 'idle' };
      });

      steps.push({
        array: snapshotMatch,
        pointers: { 'i': i },
        description: `Encontrado! arr[${i}] = ${target}`,
        found: true,
        stepIndex: steps.length,
      });

      return { steps, foundIndex, config };
    }
  }

  // no encontrado
  steps.push({
    array: array.map((valor): ElementSnapshot => ({ value: valor, state: 'discarded' })),
    pointers: {},
    description: `Elemento ${target} no encontrado en el arreglo`,
    found: false,
    stepIndex: steps.length,
  });

  return { steps, foundIndex, config };
}

function crearPaso(
  array: number[],
  pointers: Record<string, number>,
  description: string,
  found: boolean | null,
  stepIndex: number
): SearchStep {
  return {
    array: array.map((value): ElementSnapshot => ({ value, state: 'idle' })),
    pointers,
    description,
    found,
    stepIndex,
  };
}
