import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';
import { UnionFind } from '../utils/UnionFind';

export interface KruskalResult {
  steps: GraphStep[];
  totalWeight: number;
  mstEdges: string[];
}

// Snapshot visual de nodos
function createNodesSnapshot(graph: WeightedGraph, mstEdges?: Set<string>): { id: string; label: string; state: NodeState }[] {
  const connectedNodes = new Set<string>();
  if (mstEdges) {
    for (const edge of mstEdges) {
      const [u, v] = edge.split('-');
      connectedNodes.add(u);
      connectedNodes.add(v);
    }
  }

  return graph.nodes.map(id => ({
    id,
    label: id,
    state: connectedNodes.has(id) ? 'visited' : 'unvisited'
  }));
}

// Snapshot visual de aristas
function createEdgesSnapshot(
  allEdges: { source: string; target: string; weight: number; id: string }[],
  activeEdgeId: string | null,
  mstEdges: Set<string>,
  rejectedEdges: Set<string>
) {
  return allEdges.map(e => {
    let state: EdgeState = 'idle';
    if (mstEdges.has(e.id)) {
      state = 'inPath';
    } else if (rejectedEdges.has(e.id)) {
      state = 'rejected';
    } else if (e.id === activeEdgeId) {
      state = 'active';
    }

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
      state
    };
  });
}

// Animacion del algoritmo
export function kruskal(graph: WeightedGraph): KruskalResult {
  const steps: GraphStep[] = [];

  // Extrae aristas sin duplicar
  const edgesMap = new Map<string, { source: string; target: string; weight: number; id: string }>();

  for (const [source, neighbors] of Object.entries(graph.adjacency)) {
    for (const neighbor of neighbors) {
      // Identificador unico de arista
      const [u, v] = [source, neighbor.target].sort();
      const edgeId = `${u}-${v}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, { source: u, target: v, weight: neighbor.weight, id: edgeId });
      }
    }
  }

  const allEdges = Array.from(edgesMap.values());

  // Ordena aristas por peso
  allEdges.sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(graph.nodes);
  const mstEdges = new Set<string>();
  const rejectedEdges = new Set<string>();
  let totalWeight = 0;

  // Paso inicial
  steps.push({
    nodes: createNodesSnapshot(graph, mstEdges),
    edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
    description: `Inicio del algoritmo de Kruskal. Las aristas han sido ordenadas de menor a mayor peso.`,
    traversalType: 'kruskal'
  });

  // Itera por aristas
  for (const edge of allEdges) {
    // Evalua arista
    steps.push({
      nodes: createNodesSnapshot(graph, mstEdges),
      edges: createEdgesSnapshot(allEdges, edge.id, mstEdges, rejectedEdges),
      description: `Evaluando arista ${edge.source}-${edge.target} con peso ${edge.weight}...`,
      traversalType: 'kruskal'
    });

    // Agrega arista a arbol
    if (uf.union(edge.source, edge.target)) {
      mstEdges.add(edge.id);
      totalWeight += edge.weight;

      steps.push({
        nodes: createNodesSnapshot(graph, mstEdges),
        edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
        description: `Arista ${edge.source}-${edge.target} agregada al MST. Peso acumulado: ${totalWeight}`,
        traversalType: 'kruskal'
      });
    } else {
      // Descarta ciclo
      rejectedEdges.add(edge.id);

      steps.push({
        nodes: createNodesSnapshot(graph, mstEdges),
        edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
        description: `La arista ${edge.source}-${edge.target} formaría un ciclo. Se descarta.`,
        traversalType: 'kruskal'
      });
    }

  }

  // Finaliza algoritmo
  steps.push({
    nodes: createNodesSnapshot(graph, mstEdges),
    edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
    description: `Kruskal finalizado. Peso total del Árbol Abarcador Mínimo: ${totalWeight}`,
    traversalType: 'kruskal'
  });

  return {
    steps,
    totalWeight,
    mstEdges: Array.from(mstEdges)
  };
}
