export interface NodeData {
  id: string;
  label: string;
  value?: number;
  // TODO: Anadir mas estados
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  weight?: number;
}

export interface GraphStep {
  nodes: NodeData[];
  edges: EdgeData[];
  description: string;
}
