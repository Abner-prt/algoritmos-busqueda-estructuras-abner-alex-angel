import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';

// Resultado de Dijkstra
export interface DijkstraResult {
  steps: GraphStep[];
  // Distancias calculadas
  distances: Record<string, number>;
  // Nodos previos
  previous: Record<string, string | null>;
  // Camino final
  path: string[];
}

// Snapshot visual de nodos
function createNodesSnapshot(
  graph: WeightedGraph,
  visited: Set<string>,
  currentNode: string,
  pathNodes: Set<string>
) {
  return graph.nodes.map(id => {
    let state: NodeState = 'unvisited';
    if (pathNodes.has(id)) state = 'path';
    else if (id === currentNode) state = 'visiting';
    else if (visited.has(id)) state = 'visited';
    
    return { id, label: id, state };
  });
}

// Snapshot visual de aristas
function createEdgesSnapshot(
  graph: WeightedGraph,
  activeEdgeId: string | null,
  pathEdges: Set<string>
) {
  const edgesMap = new Map<string, { source: string; target: string; weight: number; id: string }>();
  
  for (const [source, neighbors] of Object.entries(graph.adjacency)) {
    for (const neighbor of neighbors) {
      const [u, v] = [source, neighbor.target].sort();
      const edgeId = `${u}-${v}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, { source: u, target: v, weight: neighbor.weight, id: edgeId });
      }
    }
  }

  return Array.from(edgesMap.values()).map(e => {
    let state: EdgeState = 'idle';
    if (pathEdges.has(e.id)) {
      state = 'inPath';
    } else if (e.id === activeEdgeId) {
      state = 'active';
    }
    
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
      state,
    };
  });
}

// Animacion del algoritmo
export function dijkstra(
  graph: WeightedGraph,
  startId: string,
  endId?: string
): DijkstraResult {
  const steps: GraphStep[] = [];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const unvisited = new Set(graph.nodes);

  for (const node of graph.nodes) {
    distances[node] = node === startId ? 0 : Infinity;
    previous[node] = null;
  }

  // Paso inicial
  steps.push({
    nodes: createNodesSnapshot(graph, visited, startId, new Set()),
    edges: createEdgesSnapshot(graph, null, new Set()),
    description: `Inicio desde el nodo ${startId} con distancia 0`,
  });

  while (unvisited.size > 0) {
    // Busca menor distancia
    let current = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    // Verifica destino
    if (current === null || (endId && current === endId)) {
      break;
    }

    unvisited.delete(current);
    visited.add(current);

    steps.push({
      nodes: createNodesSnapshot(graph, visited, current, new Set()),
      edges: createEdgesSnapshot(graph, null, new Set()),
      description: `Visitando nodo ${current}, distancia minima actual: ${distances[current]}`,
    });

    const neighbors = graph.adjacency[current] || [];
    
    // Relajacion de aristas
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.target)) continue;

      const [u, v] = [current, neighbor.target].sort();
      const edgeId = `${u}-${v}`;
      const newDistance = distances[current] + neighbor.weight;

      const getTreeEdges = () => {
        const edges = new Set<string>();
        for (const [node, prev] of Object.entries(previous)) {
          if (prev) {
            const [pu, pv] = [node, prev].sort();
            edges.add(`${pu}-${pv}`);
          }
        }
        return edges;
      };

      steps.push({
        nodes: createNodesSnapshot(graph, visited, current, new Set()),
        edges: createEdgesSnapshot(graph, edgeId, getTreeEdges()),
        description: `Evaluando camino a ${neighbor.target} a traves de ${current} con peso ${neighbor.weight}`,
      });

      if (newDistance < distances[neighbor.target]) {
        distances[neighbor.target] = newDistance;
        previous[neighbor.target] = current;
        
        steps.push({
          nodes: createNodesSnapshot(graph, visited, current, new Set()),
          edges: createEdgesSnapshot(graph, edgeId, getTreeEdges()),
          description: `Camino mas corto encontrado a ${neighbor.target}. Nueva distancia es ${newDistance}`,
        });
      }
    }
  }

  // Reconstruye camino
  const path: string[] = [];
  const pathEdges = new Set<string>();
  const pathNodes = new Set<string>();
  
  if (endId && previous[endId] !== null) {
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      pathNodes.add(current);
      const prevNode: string | null = previous[current];
      if (prevNode) {
        const [u, v] = [prevNode, current].sort();
        pathEdges.add(`${u}-${v}`);
      }
      current = prevNode;
    }

    steps.push({
      nodes: createNodesSnapshot(graph, visited, '', pathNodes),
      edges: createEdgesSnapshot(graph, null, pathEdges),
      description: `Camino optimo reconstruido con distancia total de ${distances[endId]}`,
    });
  }

  return { steps, distances, previous, path };
}
