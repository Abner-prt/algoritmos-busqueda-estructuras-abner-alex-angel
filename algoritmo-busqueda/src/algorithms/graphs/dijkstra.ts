import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';

// Resultado completo 
export interface DijkstraResult {
  steps: GraphStep[];
  // Tabla de distancias minimas desde el nodo origen
  distances: Record<string, number>;
  // Nodo previo 
  previous: Record<string, string | null>;
  // Camino optimo 
  path: string[];
}

// Generador de un snapshot visual de todos los nodos
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

// Generador de un snapshot visual de todas las aristas
function createEdgesSnapshot(
  graph: WeightedGraph,
  activeEdgeId: string | null,
  pathEdges: Set<string>
) {
  return Object.entries(graph.adjacency).flatMap(([src, neighbors]) =>
    neighbors.map(n => {
      const edgeId = `${src}-${n.target}`;
      let state: EdgeState = 'idle';
      if (pathEdges.has(edgeId) || pathEdges.has(`${n.target}-${src}`)) {
        state = 'inPath';
      } else if (edgeId === activeEdgeId) {
        state = 'active';
      }
      return {
        id: edgeId,
        source: src,
        target: n.target,
        weight: n.weight,
        state,
      };
    })
  );
}

// Genera los pasos de animacion del algoritmo de Dijkstra
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
    // Buscar el nodo no visitado con la menor distancia
    let current = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    // Si no hay nodos alcanzables o llegamos al destino
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

      const edgeId = `${current}-${neighbor.target}`;
      const newDistance = distances[current] + neighbor.weight;

      steps.push({
        nodes: createNodesSnapshot(graph, visited, current, new Set()),
        edges: createEdgesSnapshot(graph, edgeId, new Set()),
        description: `Evaluando camino a ${neighbor.target} a traves de ${current} con peso ${neighbor.weight}`,
      });

      if (newDistance < distances[neighbor.target]) {
        distances[neighbor.target] = newDistance;
        previous[neighbor.target] = current;
        
        steps.push({
          nodes: createNodesSnapshot(graph, visited, current, new Set()),
          edges: createEdgesSnapshot(graph, edgeId, new Set()),
          description: `Camino mas corto encontrado a ${neighbor.target}. Nueva distancia es ${newDistance}`,
        });
      }
    }
  }

  // Reconstruccion del camino optimo
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
        pathEdges.add(`${prevNode}-${current}`);
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
