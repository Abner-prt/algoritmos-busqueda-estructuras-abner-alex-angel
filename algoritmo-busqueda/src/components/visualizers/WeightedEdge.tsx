import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

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

  const weight = data?.weight !== undefined ? String(data.weight) : '?';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: 12,
            fontWeight: 700,
            color: '#1e3a5f',
            border: '1px solid #94a3b8',
            pointerEvents: 'all',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          className="nodrag nopan"
        >
          {weight}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
