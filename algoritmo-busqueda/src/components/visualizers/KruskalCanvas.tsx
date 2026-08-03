import type { EdgeData } from '../../types/graph';

export type KruskalEdgeState = 'pending' | 'evaluating' | 'accepted' | 'rejected';

export interface KruskalEdgeVisual extends EdgeData {
  kruskalState: KruskalEdgeState;
  formsCycle: boolean;
}

interface KruskalCanvasProps {
  edges: KruskalEdgeVisual[];
  currentEdgeId?: string;
}

// Estilos para cada estado de arista
const edgeStyles: Record<KruskalEdgeState, { stroke: string; strokeWidth: number; opacity: number }> = {
  pending: { stroke: '#64748b', strokeWidth: 1.5, opacity: 0.4 },
  evaluating: { stroke: '#f59e0b', strokeWidth: 3, opacity: 1 },
  accepted: { stroke: '#22c55e', strokeWidth: 3, opacity: 1 },
  rejected: { stroke: '#ef4444', strokeWidth: 2, opacity: 0.5 },
};

// Mapea cada arista a sus propiedades visuales para react-flow
export function getKruskalEdgeStyles(edge: KruskalEdgeVisual) {
  const style = edgeStyles[edge.kruskalState];

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.weight !== undefined ? String(edge.weight) : undefined,
    animated: edge.kruskalState === 'evaluating',
    style: {
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      opacity: style.opacity,
      transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease',
      strokeDasharray: edge.kruskalState === 'rejected' ? '5 5' : undefined,
    },
  };
}

// Panel de estado de la arista actual en evaluacion
export function KruskalEdgeStatus({ edges, currentEdgeId }: KruskalCanvasProps) {
  const current = edges.find(e => e.id === currentEdgeId);
  if (!current) return null;

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-all duration-300
      ${current.formsCycle
        ? 'bg-red-50 border-red-300 text-red-800'
        : current.kruskalState === 'accepted'
          ? 'bg-green-50 border-green-300 text-green-800'
          : 'bg-yellow-50 border-yellow-300 text-yellow-800'
      }
    `}>
      <div className={`w-3 h-3 rounded-full ${current.formsCycle ? 'bg-red-500' : current.kruskalState === 'accepted' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
        }`} />
      <span className="font-medium">
        {current.source} → {current.target}
        <span className="ml-2 font-bold">(peso: {current.weight})</span>
      </span>
      {current.formsCycle && (
        <span className="ml-auto font-bold text-red-600">Ciclo detectado</span>
      )}
      {current.kruskalState === 'accepted' && !current.formsCycle && (
        <span className="ml-auto font-bold text-green-600">Aceptada</span>
      )}
    </div>
  );
}
