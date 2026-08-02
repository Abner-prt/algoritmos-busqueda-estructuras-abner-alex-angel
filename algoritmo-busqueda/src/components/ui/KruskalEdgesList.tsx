import { ArrowRight, Check, X, Search, Clock } from 'lucide-react';

export interface KruskalEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  // Estado visual en la animacion
  status: 'pending' | 'evaluating' | 'accepted' | 'rejected';
}

interface KruskalEdgesListProps {
  edges: KruskalEdge[];
  totalWeight: number;
}

// Panel lateral que muestra las aristas ordenadas para Kruskal
export function KruskalEdgesList({ edges, totalWeight }: KruskalEdgesListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border flex flex-col w-full h-[480px]">
      
      {/* Cabecera del panel */}
      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-800 text-lg">Aristas de Kruskal</h3>
        <p className="text-sm text-gray-500">Ordenadas de menor a mayor peso</p>
      </div>

      {/* Lista desplazable de aristas */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {edges.map(edge => {
          // Color de fondo segun el estado
          let bgClass = 'bg-gray-50 border-gray-200';
          if (edge.status === 'evaluating') bgClass = 'bg-yellow-50 border-yellow-300';
          if (edge.status === 'accepted') bgClass = 'bg-green-50 border-green-300';
          if (edge.status === 'rejected') bgClass = 'bg-red-50 border-red-200 opacity-60';

          return (
            <div
              key={edge.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${bgClass} transition-colors`}
            >
              <div className="flex items-center gap-3">
                {/* Icono de estado */}
                <div className="flex-shrink-0">
                  {edge.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                  {edge.status === 'evaluating' && <Search className="w-5 h-5 text-yellow-500" />}
                  {edge.status === 'accepted' && <Check className="w-5 h-5 text-green-500" />}
                  {edge.status === 'rejected' && <X className="w-5 h-5 text-red-400" />}
                </div>
                
                {/* Nodos conectados */}
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <span>{edge.source}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span>{edge.target}</span>
                </div>
              </div>

              {/* Peso de la arista */}
              <div className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md text-sm">
                Peso: {edge.weight}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie del panel con el peso total acumulado */}
      <div className="p-4 border-t bg-blue-50 rounded-b-xl flex items-center justify-between">
        <span className="font-semibold text-blue-800">Peso Total (MST):</span>
        <span className="font-bold text-2xl text-blue-600">{totalWeight}</span>
      </div>
    </div>
  );
}
