import { useCallback, useMemo, useEffect } from "react";
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
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphStep, NodeState, EdgeState } from "../../types/graph";

// Paleta de colores
const NODE_COLORS: Record<NodeState, React.CSSProperties> = {
  unvisited: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1.5px solid rgba(255, 255, 255, 0.4)",
    color: "#cbd5e1",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  visiting: {
    background: "rgba(251, 191, 36, 0.35)",
    border: "2px solid rgba(251, 191, 36, 0.9)",
    color: "#fef3c7",
    boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
  },
  visited: {
    background: "rgba(34, 197, 94, 0.3)",
    border: "2px solid rgba(34, 197, 94, 0.8)",
    color: "#dcfce7",
    boxShadow: "0 0 16px rgba(34, 197, 94, 0.4)",
  },
  path: {
    background: "rgba(59, 130, 246, 0.4)",
    border: "2px solid rgba(59, 130, 246, 1)",
    color: "#eff6ff",
    boxShadow: "0 0 24px rgba(59, 130, 246, 0.6)",
  },
  queued: {
    background: "rgba(168, 85, 247, 0.3)",
    border: "2px solid rgba(168, 85, 247, 0.8)",
    color: "#f3e8ff",
    boxShadow: "0 0 16px rgba(168, 85, 247, 0.4)",
  },
  stacked: {
    background: "rgba(236, 72, 153, 0.3)",
    border: "2px solid rgba(236, 72, 153, 0.8)",
    color: "#fce7f3",
    boxShadow: "0 0 16px rgba(236, 72, 153, 0.4)",
  },
};

// Colores de aristas
const EDGE_COLORS: Record<EdgeState, string> = {
  idle: "#475569",
  active: "#fbbf24",
  inPath: "#3b82f6",
  rejected: "#ef4444",
  traversed: "#10b981",
};

// Estilo base de nodo
const BASE_NODE_STYLE: React.CSSProperties = {
  backdropFilter: "blur(10px)",
  borderRadius: "50%",
  width: 52,
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 16,
  transition: "all 0.35s ease",
};


const CustomGraphNode = ({ data, style }: any) => {
  const handleStyle = { background: '#94a3b8', border: 'none' };
  return (
    <div style={style}>
      {/* Top */}
      <Handle type="target" position={Position.Top} id="top-tgt" style={handleStyle} />
      <Handle type="source" position={Position.Top} id="top-src" style={{ ...handleStyle, opacity: 0 }} />
      {/* Right */}
      <Handle type="target" position={Position.Right} id="right-tgt" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-src" style={{ ...handleStyle, opacity: 0 }} />
      {/* Bottom */}
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={{ ...handleStyle, opacity: 0 }} />
      {/* Left */}
      <Handle type="target" position={Position.Left} id="left-tgt" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left-src" style={{ ...handleStyle, opacity: 0 }} />
      {data.label}
    </div>
  );
};

const nodeTypes = { custom: CustomGraphNode };

// Nodos de muestra
const DEMO_NODES: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 50 },
    data: { label: "1", nodeState: "visited" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 100, y: 180 },
    data: { label: "2", nodeState: "visiting" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 400, y: 180 },
    data: { label: "3", nodeState: "unvisited" },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 50, y: 320 },
    data: { label: "4", nodeState: "unvisited" },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 200, y: 320 },
    data: { label: "5", nodeState: "path" },
  },
];

// Aristas de muestra
const DEMO_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2", data: { edgeState: "active" } },
  { id: "e1-3", source: "1", target: "3", data: { edgeState: "idle" } },
  { id: "e2-4", source: "2", target: "4", data: { edgeState: "idle" } },
  { id: "e2-5", source: "2", target: "5", data: { edgeState: "inPath" } },
];

interface GraphCanvasProps {
  currentStep?: GraphStep;
  onAddEdge?: (source: string, target: string, weight?: number) => void;
  onRemoveNode?: (nodeId: string) => void;
  onRemoveEdge?: (source: string, target: string) => void;
  onUpdateEdgeWeights?: (updates: { source: string, target: string, weight: number }[]) => void;
  mode?: string;
}

// Lienzo de grafos
export function GraphCanvas({ currentStep, onAddEdge, onRemoveNode, onRemoveEdge,
  onUpdateEdgeWeights,
  mode,
}: GraphCanvasProps) {
  // Estilos a nodos muestra
  const styledDemoNodes = useMemo(
    () =>
      DEMO_NODES.map((n) => ({
        ...n,
        style: {
          ...BASE_NODE_STYLE,
          ...NODE_COLORS[(n.data.nodeState as NodeState) ?? "unvisited"],
        },
      })),
    [],
  );

  // Estilos a aristas muestra
  const styledDemoEdges = useMemo(
    () =>
      DEMO_EDGES.map((e) => ({
        ...e,
        style: {
          stroke: EDGE_COLORS[(e.data?.edgeState as EdgeState) ?? "idle"],
          strokeWidth:
            e.data?.edgeState === "active" || e.data?.edgeState === "inPath"
              ? 3
              : 1.5,
          transition: "stroke 0.3s ease",
        },
      })),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(styledDemoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledDemoEdges);

  // Efecto para sincronizar los nodos y aristas con la animacion

  useEffect(() => {
    if (currentStep) {
      setNodes((nds) =>
        currentStep.nodes.map((n) => {
          const existing = nds.find((en) => en.id === n.id);
          const demoNode = DEMO_NODES.find((dn) => dn.id === n.id);
          return {
            id: n.id,
            type: "custom",
            position: existing?.position || demoNode?.position || { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
            data: { label: n.label },
            style: {
              ...BASE_NODE_STYLE,
              ...NODE_COLORS[n.state ?? "unvisited"],
            },
          };
        }),
      );

      setEdges((eds) =>
        currentStep.edges.map((e) => {
          const existingEdge = eds.find(
            (ee) =>
              (ee.source === e.source && ee.target === e.target) ||
              (ee.source === e.target && ee.target === e.source)
          );

          const newStyle = {
            stroke: EDGE_COLORS[e.state ?? "idle"],
            strokeWidth: e.state === "active" || e.state === "inPath" ? 3 : 1.5,
            transition: "stroke 0.3s ease, stroke-width 0.3s ease",
          };
          const newLabel = e.weight !== undefined ? String(e.weight) : undefined;

          if (existingEdge) {

            return {
              id: existingEdge.id,
              source: existingEdge.source,
              target: existingEdge.target,
              sourceHandle: existingEdge.sourceHandle,
              targetHandle: existingEdge.targetHandle,
              type: existingEdge.type,
              selected: existingEdge.selected,
              style: newStyle,
              label: newLabel,
            };
          }

          return {
            id: e.id,
            source: e.source,
            target: e.target,
            style: newStyle,
            label: newLabel,
          };
        }),
      );
    } else {
      setNodes(styledDemoNodes);
      setEdges(styledDemoEdges);
    }
  }, [currentStep, setNodes, setEdges, styledDemoNodes, styledDemoEdges]);

  // Maneja conexion
  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      if (onAddEdge && params.source && params.target) {
        // Calcular distancia euclidiana para el peso
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        let weight = 3;

        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          weight = Math.max(1, Math.round(distance / 20)); // Escalar para tener numeros pequenos
        }

        onAddEdge(params.source, params.target, weight);
      }
    },
    [setEdges, onAddEdge, nodes],
  );

  // Maneja el fin del arrastre de nodos para recalcular distancias
  const onNodeDragStop = useCallback((_event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, draggedNode: Node) => {
    if (!onUpdateEdgeWeights) return;

    // Buscar todas las aristas conectadas a este nodo
    const connectedEdges = edges.filter(e => e.source === draggedNode.id || e.target === draggedNode.id);
    if (connectedEdges.length === 0) return;

    const updates: { source: string, target: string, weight: number }[] = [];

    connectedEdges.forEach(edge => {
      // Usamos el draggedNode que tiene la posicion 100% final, y buscamos el otro en el estado
      const sourceNode = edge.source === draggedNode.id ? draggedNode : nodes.find(n => n.id === edge.source);
      const targetNode = edge.target === draggedNode.id ? draggedNode : nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const newWeight = Math.max(1, Math.round(distance / 20));

        updates.push({ source: edge.source, target: edge.target, weight: newWeight });
      }
    });

    if (updates.length > 0) {
      onUpdateEdgeWeights(updates);
    }
  }, [edges, nodes, onUpdateEdgeWeights]);

  // Maneja borrado
  const onNodesDelete = useCallback((deleted: Node[]) => {
    if (onRemoveNode) deleted.forEach(n => onRemoveNode(n.id));
  }, [onRemoveNode]);

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    if (onRemoveEdge) deleted.forEach(e => onRemoveEdge(e.source, e.target));
  }, [onRemoveEdge]);

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      style={{
        height: 480,
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        {/* Fondo con puntos */}
        <Background color="#334155" gap={20} size={1} />

        {/* Controles de zoom */}
        <Controls className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg" />

        {/* Leyenda de estados */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg p-3 text-xs">
          {(() => {
            const items = [{ id: "unvisited", label: "No visitado", color: "rgba(255, 255, 255, 0.4)" }];
            const m = mode?.toLowerCase();

            if (m === 'bfs') {
              items.push({ id: "visiting", label: "Visitando", color: "rgba(251, 191, 36, 0.9)" });
              items.push({ id: "visited", label: "Visitado", color: "rgba(34, 197, 94, 0.8)" });
              items.push({ id: "queued", label: "En Cola", color: "rgba(168, 85, 247, 0.8)" });
            } else if (m === 'dfs') {
              items.push({ id: "visiting", label: "Visitando", color: "rgba(251, 191, 36, 0.9)" });
              items.push({ id: "visited", label: "Visitado", color: "rgba(34, 197, 94, 0.8)" });
              items.push({ id: "stacked", label: "En Pila", color: "rgba(236, 72, 153, 0.8)" });
            } else if (m === 'kruskal') {
              items.push({ id: "visited", label: "Conectado (Nodo)", color: "rgba(34, 197, 94, 0.8)" });
              items.push({ id: "evaluating", label: "Evaluando (Arista)", color: "#fbbf24" }); // Yellow
              items.push({ id: "in-tree", label: "En Árbol (Arista)", color: "#3b82f6" }); // Blue
              items.push({ id: "rejected", label: "Descartada (Arista)", color: "#ef4444" }); // Red
            } else {
              items.push({ id: "visiting", label: "Visitando", color: "rgba(251, 191, 36, 0.9)" });
              items.push({ id: "visited", label: "Visitado", color: "rgba(34, 197, 94, 0.8)" });
              items.push({ id: "path", label: "Ruta Óptima", color: "rgba(59, 130, 246, 1)" });
            }
            return items.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-slate-300">{s.label}</span>
              </div>
            ));
          })()}
        </div>

        {/* Mini mapa */}
        <MiniMap
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
          nodeColor={(n) => {
            const ns = (n.data?.nodeState as NodeState) ?? "unvisited";
            return (
              NODE_COLORS[ns].border
                ?.toString()
                .replace("2px solid ", "")
                .replace("1.5px solid ", "") ?? "#475569"
            );
          }}
        />
      </ReactFlow>
    </div>
  );
}
