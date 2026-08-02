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

// Genera el estado visual de cada arista
function createEdgesSnapshot(
  graph: WeightedGraph,
  activeEdgeId: string | null,
  traversedEdges: Set<string>
) {
  return Object.entries(graph.adjacency).flatMap(([src, neighbors]) =>
    neighbors.map(n => {
      const edgeId = `${src}-${n.target}`;
      let state: EdgeState = 'idle';
      if (edgeId === activeEdgeId) state = 'active';
      else if (traversedEdges.has(edgeId) || traversedEdges.has(`${n.target}-${src}`)) state = 'traversed';
      return { id: edgeId, source: src, target: n.target, weight: n.weight, state };
    })
  );
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

    const neighbors = graph.adjacency[current] || [];

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

    const neighbors = graph.adjacency[current] || [];

    // Recorrer vecinos en orden inverso
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
