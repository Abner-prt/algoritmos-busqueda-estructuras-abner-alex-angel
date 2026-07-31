// Estados posibles de un nodo durante la animacion
export type NodeState = 'unvisited' | 'visiting' | 'visited' | 'path';

// Estados posibles de una arista durante la animacion
export type EdgeState = 'idle' | 'active' | 'inPath' | 'rejected';

export interface NodeData {
  id: string;
  label: string;
  value?: number;
  // Estado visual del nodo en la animacion actual
  state?: NodeState;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  // Peso de la arista para grafos ponderados
  weight?: number;
  // Estado visual de la arista en la animacion actual
  state?: EdgeState;
}

export interface GraphStep {
  nodes: NodeData[];
  edges: EdgeData[];
  description: string;
}

// Grafo ponderado con listas de adyacencia
export interface WeightedGraph {
  nodes: string[];
  // Mapa de nodo origen a sus vecinos con peso
  adjacency: Record<string, { target: string; weight: number }[]>;
}
