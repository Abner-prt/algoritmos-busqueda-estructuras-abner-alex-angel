import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphStep, NodeState, EdgeState } from '../../types/graph';

// Paleta de colores segun el estado del nodo
const NODE_COLORS: Record<NodeState, React.CSSProperties> = {
  unvisited: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1.5px solid rgba(255, 255, 255, 0.4)',
    color: '#cbd5e1',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  visiting: {
    background: 'rgba(251, 191, 36, 0.35)',
    border: '2px solid rgba(251, 191, 36, 0.9)',
    color: '#fef3c7',
    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
  },
  visited: {
    background: 'rgba(34, 197, 94, 0.3)',
    border: '2px solid rgba(34, 197, 94, 0.8)',
    color: '#dcfce7',
    boxShadow: '0 0 16px rgba(34, 197, 94, 0.4)',
  },
  path: {
    background: 'rgba(59, 130, 246, 0.4)',
    border: '2px solid rgba(59, 130, 246, 1)',
    color: '#eff6ff',
    boxShadow: '0 0 24px rgba(59, 130, 246, 0.6)',
  },
};

// Colores de aristas segun su estado en la animacion
const EDGE_COLORS: Record<EdgeState, string> = {
  idle:     '#475569',
  active:   '#fbbf24',
  inPath:   '#3b82f6',
  rejected: '#ef4444',
};

// Datos base del nodo compartidos por el estilo glassmorphism
const BASE_NODE_STYLE: React.CSSProperties = {
  backdropFilter: 'blur(10px)',
  borderRadius: '50%',
  width: 52,
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 16,
  transition: 'all 0.35s ease',
};

// Nodos de muestra para demostrar los estados visuales
const DEMO_NODES: Node[] = [
  { id: '1', position: { x: 250, y: 50  }, data: { label: 'A', nodeState: 'visited'   } },
  { id: '2', position: { x: 100, y: 180 }, data: { label: 'B', nodeState: 'visiting'  } },
  { id: '3', position: { x: 400, y: 180 }, data: { label: 'C', nodeState: 'unvisited' } },
  { id: '4', position: { x: 50,  y: 320 }, data: { label: 'D', nodeState: 'unvisited' } },
  { id: '5', position: { x: 200, y: 320 }, data: { label: 'E', nodeState: 'path'      } },
];

// Aristas de muestra con distintos estados de animacion
const DEMO_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', data: { edgeState: 'active'   } },
  { id: 'e1-3', source: '1', target: '3', data: { edgeState: 'idle'     } },
  { id: 'e2-4', source: '2', target: '4', data: { edgeState: 'idle'     } },
  { id: 'e2-5', source: '2', target: '5', data: { edgeState: 'inPath'   } },
];

// Convierte un paso del algoritmo en nodos y aristas con estilos aplicados
function applyStepStyles(step: GraphStep): { nodes: Node[]; edges: Edge[] } {
  const nodes = step.nodes.map(n => ({
    id: n.id,
    position: { x: 0, y: 0 },
    data: { label: n.label },
    style: {
      ...BASE_NODE_STYLE,
      ...(NODE_COLORS[n.state ?? 'unvisited']),
    },
  }));

  const edges = step.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: {
      stroke: EDGE_COLORS[e.state ?? 'idle'],
      strokeWidth: e.state === 'active' || e.state === 'inPath' ? 3 : 1.5,
      transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
    },
    label: e.weight !== undefined ? String(e.weight) : undefined,
  }));

  return { nodes, edges };
}

interface GraphCanvasProps {
  // Paso actual del algoritmo a renderizar (opcional)
  currentStep?: GraphStep;
}

// Lienzo interactivo de grafos con estados visuales animados
export function GraphCanvas({ currentStep }: GraphCanvasProps) {

  // Aplica estilos base a los nodos de muestra
  const styledDemoNodes = useMemo(() =>
    DEMO_NODES.map(n => ({
      ...n,
      style: {
        ...BASE_NODE_STYLE,
        ...(NODE_COLORS[(n.data.nodeState as NodeState) ?? 'unvisited']),
      },
    })),
    []
  );

  // Aplica colores base a las aristas de muestra
  const styledDemoEdges = useMemo(() =>
    DEMO_EDGES.map(e => ({
      ...e,
      style: {
        stroke: EDGE_COLORS[(e.data?.edgeState as EdgeState) ?? 'idle'],
        strokeWidth: e.data?.edgeState === 'active' || e.data?.edgeState === 'inPath' ? 3 : 1.5,
        transition: 'stroke 0.3s ease',
      },
    })),
    []
  );

  // Usa los datos del paso actual si existen, si no usa los datos de muestra
  const derivedStep = currentStep ? applyStepStyles(currentStep) : null;

  const [nodes, , onNodesChange] = useNodesState(derivedStep?.nodes ?? styledDemoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(derivedStep?.edges ?? styledDemoEdges);

  // Conecta dos nodos cuando el usuario arrastra una arista entre ellos
  const onConnect: OnConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      style={{
        height: 480,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        {/* Fondo con patron de puntos */}
        <Background color="#334155" gap={20} size={1} />

        {/* Controles de zoom y encuadre */}
        <Controls className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg" />

        {/* Leyenda de estados de los nodos */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg p-3 text-xs">
          {(['unvisited', 'visiting', 'visited', 'path'] as NodeState[]).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: NODE_COLORS[s].border?.toString().replace('2px solid ', '') }}
              />
              <span className="text-slate-300 capitalize">{s}</span>
            </div>
          ))}
        </div>

        {/* Mapa de miniatura del grafo */}
        <MiniMap
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          nodeColor={n => {
            const ns = (n.data?.nodeState as NodeState) ?? 'unvisited';
            return NODE_COLORS[ns].border?.toString().replace('2px solid ', '').replace('1.5px solid ', '') ?? '#475569';
          }}
        />
      </ReactFlow>
    </div>
  );
}
