import { useState, useEffect } from 'react';
import { MapPin, Navigation, Infinity as InfinityIcon, TrendingDown, Trophy } from 'lucide-react';

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
  isFinished?: boolean;
  optimalCost?: number;
}

export function DijkstraTable({ rows, startNode, endNode, isFinished, optimalCost }: DijkstraTableProps) {
  // Guardar distancias previas para detectar cambios
  const [prevDistances, setPrevDistances] = useState<Record<string, number>>({});
  const [changedNodes, setChangedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newChanged = new Set<string>();
    for (const row of rows) {
      const prev = prevDistances[row.nodeId];
      if (prev !== undefined && prev !== row.distance) {
        newChanged.add(row.nodeId);
      }
    }
    setChangedNodes(newChanged);

    const updated: Record<string, number> = {};
    for (const row of rows) {
      updated[row.nodeId] = row.distance;
    }
    setPrevDistances(updated);

    // Limpiar animacion despues de 600ms
    if (newChanged.size > 0) {
      const timer = setTimeout(() => setChangedNodes(new Set()), 600);
      return () => clearTimeout(timer);
    }
  }, [rows]);

  const visitedCount = rows.filter(r => r.visited).length;

  return (
    <div className="bg-white rounded-xl shadow-lg border flex flex-col w-full h-auto max-h-[480px]">

      <div className="p-3 sm:p-4 border-b bg-gray-50 rounded-t-xl">
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
              const justChanged = changedNodes.has(row.nodeId);
              let rowClass = 'border-t border-gray-100 transition-all duration-300';
              if (justChanged) rowClass += ' bg-amber-100';
              else if (row.isCurrent) rowClass += ' bg-yellow-50';
              else if (row.visited) rowClass += ' bg-green-50/50';

              return (
                <tr key={row.nodeId} className={rowClass}>
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
                    <div className="flex items-center justify-center gap-1">
                      {justChanged && <TrendingDown className="w-3 h-3 text-amber-600 animate-bounce" />}
                      {row.distance === Infinity ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <InfinityIcon className="w-4 h-4" /> ∞
                        </span>
                      ) : (
                        <span className={`font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
                          justChanged
                            ? 'text-amber-800 bg-amber-200 scale-110'
                            : 'text-blue-700 bg-blue-100'
                        }`}>
                          {row.distance}
                        </span>
                      )}
                    </div>
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

      {/* Pie con progreso y costo final */}
      <div className="p-3 border-t bg-gray-50 rounded-b-xl flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {visitedCount} / {rows.length} nodos visitados
        </span>
        {isFinished && optimalCost !== undefined && (
          <div className="flex items-center gap-1.5 text-sm font-bold text-green-700">
            <Trophy className="w-4 h-4" />
            Costo: {optimalCost}
          </div>
        )}
      </div>
    </div>
  );
}
