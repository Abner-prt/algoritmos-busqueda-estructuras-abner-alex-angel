import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';

export interface TraversalResult {
  steps: GraphStep[];
  visitOrder: string[];
}

// Genera el estado visual de cada nodo
function createNodesSnapshot(
  graph: WeightedGraph,
  visited: Set<string>,
  currentNode: string,
  queued: Set<string>,
  traversalType: 'bfs' | 'dfs'
) {
  return graph.nodes.map(id => {
    let state: NodeState = 'unvisited';
    if (id === currentNode) state = 'visiting';
    else if (visited.has(id)) state = 'visited';
    else if (queued.has(id)) state = traversalType === 'bfs' ? 'queued' : 'stacked';
    return { id, label: id, state };
  });
}

function createEdgesSnapshot(
  graph: WeightedGraph,
  activeEdgeId: string | null,
  traversedEdges: Set<string>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edgesMap = new Map<string, any>();

  Object.entries(graph.adjacency).forEach(([src, neighbors]) => {
    neighbors.forEach(n => {
      const [u, v] = [src, n.target].sort();
      const edgeId = `${u}-${v}`;

      if (!edgesMap.has(edgeId)) {
        let state: EdgeState = 'idle';
        const dir1 = `${u}-${v}`;
        const dir2 = `${v}-${u}`;

        if (dir1 === activeEdgeId || dir2 === activeEdgeId) {
          state = 'active';
        } else if (traversedEdges.has(dir1) || traversedEdges.has(dir2)) {
          state = 'traversed';
        }

        edgesMap.set(edgeId, {
          id: edgeId,
          source: u,
          target: v,
          weight: n.weight,
          state
        });
      }
    });
  });

  return Array.from(edgesMap.values());
}

// Recorrido en anchura
export function bfs(graph: WeightedGraph, startId: string): TraversalResult {
  const steps: GraphStep[] = [];
  const visited = new Set<string>();
  const inQueue = new Set<string>();
  const traversedEdges = new Set<string>();
  const visitOrder: string[] = [];

  const cola: string[] = [];
  cola.push(startId);
  inQueue.add(startId);

  steps.push({
    nodes: createNodesSnapshot(graph, visited, '', inQueue, 'bfs'),
    edges: createEdgesSnapshot(graph, null, traversedEdges),
    description: `Inicio BFS desde nodo ${startId}. Cola: [${startId}]`,
    currentNodeId: startId,
    auxiliaryStructure: [...cola],
    traversalType: 'bfs',
  });

  while (cola.length > 0) {
    // Sacar el primero de la cola
    const current = cola.shift()!;
    inQueue.delete(current);
    visited.add(current);
    visitOrder.push(current);

    steps.push({
      nodes: createNodesSnapshot(graph, visited, current, inQueue, 'bfs'),
      edges: createEdgesSnapshot(graph, null, traversedEdges),
      description: `Visitando nodo ${current}. Cola: [${cola.join(', ')}]`,
      currentNodeId: current,
      auxiliaryStructure: [...cola],
      traversalType: 'bfs',
    });

    const neighbors = [...(graph.adjacency[current] || [])].sort((a, b) => a.weight - b.weight);

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.target) || inQueue.has(neighbor.target)) continue;

      const edgeId = `${current}-${neighbor.target}`;
      traversedEdges.add(edgeId);
      cola.push(neighbor.target);
      inQueue.add(neighbor.target);

      steps.push({
        nodes: createNodesSnapshot(graph, visited, current, inQueue, 'bfs'),
        edges: createEdgesSnapshot(graph, edgeId, traversedEdges),
        description: `Encolando vecino ${neighbor.target}. Cola: [${cola.join(', ')}]`,
        currentNodeId: current,
        auxiliaryStructure: [...cola],
        traversalType: 'bfs',
      });
    }
  }

  steps.push({
    nodes: graph.nodes.map(id => ({ id, label: id, state: 'visited' as NodeState })),
    edges: createEdgesSnapshot(graph, null, traversedEdges),
    description: `BFS completado. Orden de visita: ${visitOrder.join(' → ')}`,
    auxiliaryStructure: [],
    traversalType: 'bfs',
  });

  return { steps, visitOrder };
}

// Recorrido en profundidad
export function dfs(graph: WeightedGraph, startId: string): TraversalResult {
  const steps: GraphStep[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const traversedEdges = new Set<string>();
  const visitOrder: string[] = [];

  const pila: string[] = [];
  pila.push(startId);
  inStack.add(startId);

  steps.push({
    nodes: createNodesSnapshot(graph, visited, '', inStack, 'dfs'),
    edges: createEdgesSnapshot(graph, null, traversedEdges),
    description: `Inicio DFS desde nodo ${startId}. Pila: [${startId}]`,
    currentNodeId: startId,
    auxiliaryStructure: [...pila],
    traversalType: 'dfs',
  });

  while (pila.length > 0) {
    // Sacar el ultimo de la pila
    const current = pila.pop()!;
    inStack.delete(current);

    if (visited.has(current)) continue;

    visited.add(current);
    visitOrder.push(current);

    steps.push({
      nodes: createNodesSnapshot(graph, visited, current, inStack, 'dfs'),
      edges: createEdgesSnapshot(graph, null, traversedEdges),
      description: `Visitando nodo ${current}. Pila: [${pila.join(', ')}]`,
      currentNodeId: current,
      auxiliaryStructure: [...pila],
      traversalType: 'dfs',
    });

    const neighbors = [...(graph.adjacency[current] || [])].sort((a, b) => a.weight - b.weight);

    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      if (visited.has(neighbor.target)) continue;

      const edgeId = `${current}-${neighbor.target}`;
      traversedEdges.add(edgeId);
      pila.push(neighbor.target);
      inStack.add(neighbor.target);

      steps.push({
        nodes: createNodesSnapshot(graph, visited, current, inStack, 'dfs'),
        edges: createEdgesSnapshot(graph, edgeId, traversedEdges),
        description: `Apilando vecino ${neighbor.target}. Pila: [${pila.join(', ')}]`,
        currentNodeId: current,
        auxiliaryStructure: [...pila],
        traversalType: 'dfs',
      });
    }
  }

  steps.push({
    nodes: graph.nodes.map(id => ({ id, label: id, state: 'visited' as NodeState })),
    edges: createEdgesSnapshot(graph, null, traversedEdges),
    description: `DFS completado. Orden de visita: ${visitOrder.join(' → ')}`,
    auxiliaryStructure: [],
    traversalType: 'dfs',
  });

  return { steps, visitOrder };
}
