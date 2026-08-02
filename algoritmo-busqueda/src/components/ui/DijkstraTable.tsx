import { MapPin, Navigation, Infinity as InfinityIcon } from 'lucide-react';

export interface DijkstraRow {
  nodeId: string;
  distance: number;
  previous: string | null;
  visited: boolean;
  isCurrent: boolean;
}

interface DijkstraTableProps {
  rows: DijkstraRow[];
  startNode: string;
  endNode?: string;
}

export function DijkstraTable({ rows, startNode, endNode }: DijkstraTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border flex flex-col w-full h-[480px]">

      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-800 text-lg">Tabla de Distancias</h3>
        <p className="text-sm text-gray-500">
          Desde <span className="font-semibold text-blue-600">{startNode}</span>
          {endNode && (
            <> hacia <span className="font-semibold text-green-600">{endNode}</span></>
          )}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Nodo</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-600">Distancia</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-600">Previo</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              let rowClass = 'border-t border-gray-100';
              if (row.isCurrent) rowClass += ' bg-yellow-50';
              else if (row.visited) rowClass += ' bg-green-50/50';

              return (
                <tr key={row.nodeId} className={`${rowClass} transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.nodeId === startNode ? (
                        <Navigation className="w-4 h-4 text-blue-500" />
                      ) : row.nodeId === endNode ? (
                        <MapPin className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-gray-300 inline-block" />
                      )}
                      <span className="font-medium text-gray-800">{row.nodeId}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.distance === Infinity ? (
                      <span className="flex items-center justify-center gap-1 text-gray-400">
                        <InfinityIcon className="w-4 h-4" /> ∞
                      </span>
                    ) : (
                      <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {row.distance}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-gray-600">
                    {row.previous ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.isCurrent ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                        Procesando
                      </span>
                    ) : row.visited ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">
                        Visitado
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t bg-gray-50 rounded-b-xl text-xs text-gray-500 text-center">
        {rows.filter(r => r.visited).length} / {rows.length} nodos visitados
      </div>
    </div>
  );
}
