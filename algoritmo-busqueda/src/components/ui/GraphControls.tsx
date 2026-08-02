interface GraphControlsProps {
  mode: 'BFS' | 'DFS';
  onModeChange: (mode: 'BFS' | 'DFS') => void;
  onGenerateTree: () => void;
  onGenerateDense: () => void;
  onGenerateLinked: () => void;
}

export function GraphControls({
  mode,
  onModeChange,
  onGenerateTree,
  onGenerateDense,
  onGenerateLinked,
}: GraphControlsProps) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm w-full max-w-sm flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Algoritmo de Recorrido</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('BFS')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'BFS' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BFS (Anchura)
          </button>
          <button
            onClick={() => onModeChange('DFS')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'DFS' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DFS (Profundidad)
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Generadores Rápidos</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onGenerateTree}
            className="px-2 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Árbol
          </button>
          <button
            onClick={onGenerateDense}
            className="px-2 py-2 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Denso
          </button>
          <button
            onClick={onGenerateLinked}
            className="px-2 py-2 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Enlazado
          </button>
        </div>
      </div>
    </div>
  );
}
