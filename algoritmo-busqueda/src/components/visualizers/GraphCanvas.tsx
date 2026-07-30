import { useCallback } from 'react';
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

// Nodos iniciales de demostración para el lienzo
const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 },  data: { label: 'A' } },
  { id: '2', position: { x: 100, y: 180 }, data: { label: 'B' } },
  { id: '3', position: { x: 400, y: 180 }, data: { label: 'C' } },
  { id: '4', position: { x: 50,  y: 320 }, data: { label: 'D' } },
  { id: '5', position: { x: 200, y: 320 }, data: { label: 'E' } },
];

// Aristas iniciales de demostracion
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e2-5', source: '2', target: '5' },
];

// Estilos de nodo con efecto Glassmorphism
const nodeStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.45)',
  borderRadius: '50%',
  width: 52,
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 16,
  color: '#1e3a5f',
  boxShadow: '0 4px 20px rgba(0, 100, 255, 0.15)',
};

// Lienzo interactivo principal para la visualizacion de grafos
export function GraphCanvas() {
  const [nodes, , onNodesChange] = useNodesState(
    initialNodes.map(n => ({ ...n, style: nodeStyle }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Conecta dos nodos cuando el usuario arrastra una arista entre ellos
  const onConnect: OnConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div
      className="w-full rounded-xl overflow-hidden border shadow-lg"
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

        {/* Mapa de miniatura del grafo */}
        <MiniMap
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          nodeColor="rgba(59, 130, 246, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
