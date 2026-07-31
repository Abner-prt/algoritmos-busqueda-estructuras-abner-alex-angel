import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';

// Resultado completo del algoritmo de Dijkstra
export interface DijkstraResult {
  steps: GraphStep[];
  // Tabla de distancias minimas desde el nodo origen
  distances: Record<string, number>;
  // Nodo previo en el camino optimo para cada nodo
  previous: Record<string, string | null>;
  // Camino optimo reconstruido como lista de IDs
  path: string[];
}

// Genera los pasos de animacion del algoritmo de Dijkstra
// TODO: Implementar la logica completa de relajacion de aristas (mas adelante)
export function dijkstra(
  graph: WeightedGraph,
  startId: string,
  _endId?: string
): DijkstraResult {

  const steps: GraphStep[] = [];

  // Inicializar todas las distancias como infinito
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    distances[node] = node === startId ? 0 : Infinity;
    previous[node] = null;
  }

  // Paso inicial: todos los nodos en estado no visitado
  steps.push({
    nodes: graph.nodes.map(id => ({
      id,
      label: id,
      state: (id === startId ? 'visiting' : 'unvisited') as NodeState,
    })),
    edges: Object.entries(graph.adjacency).flatMap(([src, neighbors]) =>
      neighbors.map(n => ({
        id: `${src}-${n.target}`,
        source: src,
        target: n.target,
        weight: n.weight,
        state: 'idle' as EdgeState,
      }))
    ),
    description: `Inicio desde el nodo ${startId} con distancia 0`,
  });

  // Marcador: la logica de relajacion se completara mas adelante
  visited.add(startId);

  return {
    steps,
    distances,
    previous,
    path: [],
  };
}
