// Estados posibles de un nodo durante la animacion
export type NodeState = 'unvisited' | 'visiting' | 'visited' | 'path' | 'queued' | 'stacked';

// Estados posibles de una arista durante la animacion
export type EdgeState = 'idle' | 'active' | 'inPath' | 'rejected' | 'traversed';

export interface NodeData {
  id: string;
  label: string;
  value?: number;
  // Estado visual del nodo en la animacion actual
  state?: NodeState;
  // Distancia acumulada (Dijkstra)
  distance?: number;
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
  // Nodo que se esta procesando en este paso
  currentNodeId?: string;
  // Contenido de la cola (BFS) o pila (DFS) en este paso
  auxiliaryStructure?: string[];
  // Tipo de recorrido para que la UI sepa que estructura mostrar
  traversalType?: 'bfs' | 'dfs' | 'dijkstra' | 'kruskal';
}

// Grafo ponderado con listas de adyacencia
export interface WeightedGraph {
  nodes: string[];
  // Mapa de nodo origen a sus vecinos con peso
  adjacency: Record<string, { target: string; weight: number }[]>;
}
