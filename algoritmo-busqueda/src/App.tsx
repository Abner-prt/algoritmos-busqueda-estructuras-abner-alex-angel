import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';

import { AppLayout } from './components/layout/AppLayout';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { SearchPanel } from './components/ui/SearchPanel';
import { GraphCanvas } from './components/visualizers/GraphCanvas';
import ArrayVisualizer from './components/visualizers/ArrayVisualizer';

import { DijkstraTable } from './components/ui/DijkstraTable';
import { KruskalEdgesList } from './components/ui/KruskalEdgesList';

import { usePlayback } from './hooks/usePlayback';
import type { SearchConfig } from './types/search';
import type { WeightedGraph, GraphStep } from './types/graph';
import { linearSearch } from './algorithms/search/linearSearch';
import { binarySearch } from './algorithms/search/binarySearch';
import { bfs, dfs } from './algorithms/graphs/traversals';
import { dijkstra, type DijkstraResult } from './algorithms/graphs/dijkstra';
import { kruskal, type KruskalResult } from './algorithms/graphs/kruskal';

// Grafo de demostracion
const demoGraph: WeightedGraph = {
  nodes: ['1', '2', '3', '4', '5'],
  adjacency: {
    '1': [{ target: '2', weight: 4 }, { target: '3', weight: 2 }],
    '2': [{ target: '1', weight: 4 }, { target: '4', weight: 5 }, { target: '5', weight: 3 }],
    '3': [{ target: '1', weight: 2 }],
    '4': [{ target: '2', weight: 5 }],
    '5': [{ target: '2', weight: 3 }]
  }
};
function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold text-blue-600">Estructuras de Datos</h1>
      <p className="text-lg text-gray-600">Algoritmos de Busqueda y Grafos</p>
      <div className="flex gap-4">
        <Link to="/search" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
          Busqueda
        </Link>
        <Link to="/graphs" className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium">
          Grafos
        </Link>
      </div>
    </div>
  );
}

function SearchPage() {
  const [logs, setLogs] = useState<string[]>([]);

  // Busqueda activa para calculo
  const [searchConfig, setSearchConfig] = useState<SearchConfig | null>(null);

  const steps = useMemo(() => {
    if (!searchConfig) return [];

    if (searchConfig.algorithm === 'binary') {
      // Búsqueda binaria requiere arreglo ordenado
      const sortedArray = [...searchConfig.array].sort((a, b) => a - b);
      return binarySearch({ ...searchConfig, array: sortedArray }).steps;
    }

    return linearSearch(searchConfig).steps;
  }, [searchConfig]);

  const { state, play, pause, stepBack, stepForward, setSpeed, reset } = usePlayback(steps.length);

  const handleSearch = (config: SearchConfig) => {
    setSearchConfig(config);
    const msgs = [
      `Buscando ${config.target} en [${config.array.join(', ')}]`,
      `Algoritmo seleccionado: ${config.algorithm === 'linear' ? 'Lineal' : 'Binaria'}`,
    ];
    if (config.algorithm === 'binary') {
      const sortedArray = [...config.array].sort((a, b) => a - b);
      msgs.push(`El arreglo fue ordenado automáticamente: [${sortedArray.join(', ')}]`);
    }
    setLogs(msgs);
  };

  const currentStepData = steps[state.currentStep];

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
        <SearchPanel onSearch={handleSearch} logs={logs} />
        <PlaybackControls
          state={state}
          onPlay={play}
          onPause={pause}
          onStepBack={stepBack}
          onStepForward={stepForward}
          onSpeedChange={setSpeed}
          onReset={reset}
        />
      </div>

      <div className="flex-1 min-h-[400px]">
        {/* Visualizador de arreglo */}
        {currentStepData ? (
          <ArrayVisualizer currentStep={currentStepData} />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-400">Presiona Buscar para visualizar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GraphsPage() {
  const [mode, setMode] = useState<'BFS' | 'DFS' | 'Dijkstra' | 'Kruskal'>('BFS');
  // Estado dinámico del grafo, inicializado con copia del demoGraph
  const [graph, setGraph] = useState<WeightedGraph>(() => JSON.parse(JSON.stringify(demoGraph)));

  const handleAddNode = useCallback(() => {
    setGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev)) as WeightedGraph;
      let nextIdNum = 1;
      while (newGraph.nodes.includes(String(nextIdNum))) {
        nextIdNum++;
      }
      const nextId = String(nextIdNum);
      newGraph.nodes.push(nextId);
      newGraph.adjacency[nextId] = [];
      return newGraph;
    });
  }, []);

  const handleAddEdge = useCallback((source: string, target: string, weight: number = 3) => {
    setGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev)) as WeightedGraph;

      if (!newGraph.adjacency[source]) newGraph.adjacency[source] = [];
      if (!newGraph.adjacency[target]) newGraph.adjacency[target] = [];

      // Evita duplicados en origen
      if (!newGraph.adjacency[source].some(e => e.target === target)) {
        newGraph.adjacency[source].push({ target, weight });
      }
      // Evita duplicados en destino (grafo no dirigido)
      if (!newGraph.adjacency[target].some(e => e.target === source)) {
        newGraph.adjacency[target].push({ target: source, weight });
      }

      return newGraph;
    });
  }, []);

  const handleUpdateEdgeWeights = useCallback((updates: { source: string, target: string, weight: number }[]) => {
    setGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev)) as WeightedGraph;

      for (const update of updates) {
        // Actualizar peso de source a target
        if (newGraph.adjacency[update.source]) {
          const edge = newGraph.adjacency[update.source].find(e => e.target === update.target);
          if (edge) edge.weight = update.weight;
        }
        // Actualizar peso de target a source
        if (newGraph.adjacency[update.target]) {
          const edge = newGraph.adjacency[update.target].find(e => e.target === update.source);
          if (edge) edge.weight = update.weight;
        }
      }

      return newGraph;
    });
  }, []);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev)) as WeightedGraph;
      newGraph.nodes = newGraph.nodes.filter(id => id !== nodeId);
      delete newGraph.adjacency[nodeId];
      for (const source in newGraph.adjacency) {
        newGraph.adjacency[source] = newGraph.adjacency[source].filter(e => e.target !== nodeId);
      }
      return newGraph;
    });
  }, []);

  const handleRemoveEdge = useCallback((source: string, target: string) => {
    setGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev)) as WeightedGraph;
      // Grafo no dirigido: remover de ambos lados
      if (newGraph.adjacency[source]) {
        newGraph.adjacency[source] = newGraph.adjacency[source].filter(e => e.target !== target);
      }
      if (newGraph.adjacency[target]) {
        newGraph.adjacency[target] = newGraph.adjacency[target].filter(e => e.target !== source);
      }
      return newGraph;
    });
  }, []);

  // Calculo reactivo de algoritmos
  const computedData = useMemo(() => {
    let calcSteps: GraphStep[] = [];
    let dijkstraData: DijkstraResult | null = null;
    let kruskalData: KruskalResult | null = null;

    if (mode === 'BFS') {
      calcSteps = bfs(graph, '1').steps;
    } else if (mode === 'DFS') {
      calcSteps = dfs(graph, '1').steps;
    } else if (mode === 'Dijkstra') {
      dijkstraData = dijkstra(graph, '1', '5');
      calcSteps = dijkstraData.steps;
    } else if (mode === 'Kruskal') {
      kruskalData = kruskal(graph);
      calcSteps = kruskalData.steps;
    }

    return { steps: calcSteps, dijkstraData, kruskalData };
  }, [mode, graph]);

  const { state, play, pause, stepBack, stepForward, setSpeed, reset } = usePlayback(computedData.steps.length);

  const currentStepData = computedData.steps[state.currentStep];

  // Mapeo de aristas para panel kruskal
  const kruskalEdgesForUI = useMemo(() => {
    if (mode !== 'Kruskal' || !currentStepData) return [];
    return currentStepData.edges.map(e => {
      let status: 'pending' | 'evaluating' | 'accepted' | 'rejected' = 'pending';
      if (e.state === 'active') status = 'evaluating';
      else if (e.state === 'inPath') status = 'accepted';
      else if (e.state === 'rejected') status = 'rejected';
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        weight: e.weight!,
        status
      };
    });
  }, [mode, currentStepData]);

  // Mapeo de nodos para panel dijkstra
  const dijkstraRowsForUI = useMemo(() => {
    if (mode !== 'Dijkstra' || !computedData.dijkstraData || !currentStepData) return [];

    return demoGraph.nodes.map(nodeId => {
      const nodeState = currentStepData.nodes.find(n => n.id === nodeId)?.state;
      return {
        nodeId,
        distance: computedData.dijkstraData!.distances[nodeId],
        previous: computedData.dijkstraData!.previous[nodeId],
        visited: nodeState === 'visited' || nodeState === 'path',
        isCurrent: nodeState === 'visiting'
      };
    });
  }, [mode, computedData.dijkstraData, currentStepData]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-700">Modo de Grafo</h3>
          <select
            className="w-full p-2 border rounded-md bg-slate-50"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as 'BFS' | 'DFS' | 'Dijkstra' | 'Kruskal');
              reset();
              setGraph(JSON.parse(JSON.stringify(demoGraph)));
            }}
          >
            <option value="BFS">BFS (Anchura)</option>
            <option value="DFS">DFS (Profundidad)</option>
            <option value="Dijkstra">Dijkstra</option>
            <option value="Kruskal">Kruskal</option>
          </select>
          <button
            onClick={handleAddNode}
            className="w-full mt-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-semibold transition-colors shadow-sm"
          >
            + Añadir Nodo
          </button>
        </div>

        <PlaybackControls
          state={state}
          onPlay={play}
          onPause={pause}
          onStepBack={stepBack}
          onStepForward={stepForward}
          onSpeedChange={setSpeed}
          onReset={reset}
        />

        {/* Paneles laterales dinamicos */}
        {mode === 'Dijkstra' && computedData.dijkstraData && (
          <DijkstraTable
            rows={dijkstraRowsForUI}
            startNode="1"
            endNode="5"
          />
        )}

        {mode === 'Kruskal' && computedData.kruskalData && (
          <KruskalEdgesList
            edges={kruskalEdgesForUI}
            totalWeight={computedData.kruskalData.totalWeight}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Panel de registro/conclusión del paso actual */}
        {currentStepData?.description && (
          <div className="bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-3 transition-all duration-300">
            <span className="text-xl">💡</span>
            <p className="font-medium">{currentStepData.description}</p>
          </div>
        )}

        <div className="flex-1 min-h-[500px]">
          <GraphCanvas
            key={mode}
            mode={mode}
            currentStep={currentStepData}
            onAddEdge={handleAddEdge}
            onRemoveNode={handleRemoveNode}
            onRemoveEdge={handleRemoveEdge}
            onUpdateEdgeWeights={handleUpdateEdgeWeights}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/graphs" element={<GraphsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
