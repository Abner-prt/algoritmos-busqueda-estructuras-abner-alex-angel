import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export function WeightedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const weight = data?.weight !== undefined ? String(data.weight) : "?";
  const edgeState = data?.state as string | undefined;

  // Determinar color de la arista según el estado
  let strokeColor = "#94a3b8"; // default
  let strokeWidth = 2;
  let zIndex = 0;

  if (edgeState === "active") {
    strokeColor = "#eab308"; // Dorado
    strokeWidth = 3;
    zIndex = 10;
  } else if (edgeState === "inPath") {
    strokeColor = "#22c55e"; // Verde brillante 
    strokeWidth = 4;
    zIndex = 20;
  } else if (edgeState === "rejected") {
    strokeColor = "#ef4444"; // Rojo 
    strokeWidth = 2;
  }

  // Estilos mezclados con los que provengan de React Flow
  const edgeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    transition: "stroke 0.3s ease, stroke-width 0.3s ease",
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            zIndex,
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "white",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: 12,
            fontWeight: 700,
            color: "#1e3a5f",
            border: "1px solid #94a3b8",
            pointerEvents: "all",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          className="nodrag nopan"
        >
          {weight}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
