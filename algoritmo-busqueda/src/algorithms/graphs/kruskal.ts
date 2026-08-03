import type { GraphStep, WeightedGraph, NodeState, EdgeState } from '../../types/graph';
import { UnionFind } from '../utils/UnionFind';

export interface KruskalResult {
  steps: GraphStep[];
  totalWeight: number;
  mstEdges: string[];
}

//  snapshot de nodos
function createNodesSnapshot(graph: WeightedGraph): { id: string; label: string; state: NodeState }[] {
  return graph.nodes.map(id => ({
    id,
    label: id,
    state: 'unvisited' // En Kruskal todos los nodos empiezan igual y no se visitan en orden
  }));
}

// snapshot de aristas
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

// Genera los pasos de animación del algoritmo de Kruskal
export function kruskal(graph: WeightedGraph): KruskalResult {
  const steps: GraphStep[] = [];
  
  // Extrae todas las aristas sin duplicar (asumiendo grafo no dirigido)
  const edgesMap = new Map<string, { source: string; target: string; weight: number; id: string }>();
  
  for (const [source, neighbors] of Object.entries(graph.adjacency)) {
    for (const neighbor of neighbors) {
      // id unico para no duplicar aristas
      const [u, v] = [source, neighbor.target].sort();
      const edgeId = `${u}-${v}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, { source: u, target: v, weight: neighbor.weight, id: edgeId });
      }
    }
  }

  const allEdges = Array.from(edgesMap.values());

  // ordenar aristas por peso de menor a mayor
  allEdges.sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(graph.nodes);
  const mstEdges = new Set<string>();
  const rejectedEdges = new Set<string>();
  let totalWeight = 0;

  // paso inicial
  steps.push({
    nodes: createNodesSnapshot(graph),
    edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
    description: `Inicio del algoritmo de Kruskal. Las aristas han sido ordenadas de menor a mayor peso.`,
    traversalType: 'kruskal'
  });

  // Iterar por cada arista
  for (const edge of allEdges) {
    // Paso: Evaluando la arista
    steps.push({
      nodes: createNodesSnapshot(graph),
      edges: createEdgesSnapshot(allEdges, edge.id, mstEdges, rejectedEdges),
      description: `Evaluando arista ${edge.source}-${edge.target} con peso ${edge.weight}...`,
      traversalType: 'kruskal'
    });

    // Si los nodos de la arista no están en el mismo conjunto, agregarla al MST
    if (uf.union(edge.source, edge.target)) {
      mstEdges.add(edge.id);
      totalWeight += edge.weight;
      
      steps.push({
        nodes: createNodesSnapshot(graph),
        edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
        description: `Arista ${edge.source}-${edge.target} agregada al MST. Peso acumulado: ${totalWeight}`,
        traversalType: 'kruskal'
      });
    } else {
      // forma un ciclo, se descarta
      rejectedEdges.add(edge.id);
      
      steps.push({
        nodes: createNodesSnapshot(graph),
        edges: createEdgesSnapshot(allEdges, null, mstEdges, rejectedEdges),
        description: `La arista ${edge.source}-${edge.target} formaría un ciclo. Se descarta.`,
        traversalType: 'kruskal'
      });
    }
    
    // Optimización: Si el MST ya tiene V-1 aristas, hemos terminado
    if (mstEdges.size === graph.nodes.length - 1) {
      break;
    }
  }

  // Paso final
  steps.push({
    nodes: createNodesSnapshot(graph),
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
