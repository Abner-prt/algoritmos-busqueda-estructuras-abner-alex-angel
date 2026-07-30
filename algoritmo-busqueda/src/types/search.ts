export type ElementState =
  | 'idle'
  | 'comparing'
  | 'match'
  | 'discarded'
  | 'inRange';

export interface ElementSnapshot {
  value: number;
  state: ElementState;
}

export interface SearchStep {
  array: ElementSnapshot[];

  //punteros activos = i lineal, L, R, Mid bin
  // Valor -1 = puntero inactivo.
  pointers: Record<string, number>;

  description: string;

  //TODO null = en curso, true = encontrado, false = no encontrado vivos aqui
  found: boolean | null;

  stepIndex: number;
}

export interface SearchConfig {
  array: number[];
  target: number;
  algorithm: 'linear' | 'binary';
}

export interface SearchResult {
  steps: SearchStep[];
  foundIndex: number;
  config: SearchConfig;
}
