import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { SearchPanel } from './components/ui/SearchPanel';
import { GraphCanvas } from './components/visualizers/GraphCanvas';
import { GraphControls } from './components/ui/GraphControls';
import { usePlayback } from './hooks/usePlayback';
import type { SearchConfig } from './types/search';
import { useState } from 'react';

// Vista principal con accesos directos a cada modulo
function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold text-blue-600">Estructuras de Datos</h1>
      <p className="text-lg text-gray-600">Algoritmos de Busqueda y Grafos</p>
      <div className="flex gap-4">
        <Link
          to="/search"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Busqueda
        </Link>
        <Link
          to="/graphs"
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
        >
          Grafos
        </Link>
      </div>
    </div>
  );
}

// Vista del modulo de busqueda con panel de entradas y controles
function SearchPage() {
  // Estado local de los logs de cada paso de busqueda
  const [logs, setLogs] = useState<string[]>([]);

  // Hook de reproduccion con 0 pasos iniciales
  const { state, play, pause, stepBack, stepForward, setSpeed, reset } = usePlayback(0);

  // Inicia la busqueda y registra los pasos en el log
  const handleSearch = (config: SearchConfig) => {
    reset();
    setLogs([
      `Buscando ${config.target} en [${config.array.join(', ')}]`,
      `Algoritmo seleccionado: ${config.algorithm === 'linear' ? 'Lineal' : 'Binaria'}`,
    ]);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Panel izquierdo de configuracion y logs */}
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

      {/* Espacio reservado para el visualizador de arreglos de Alex */}
      <div className="flex-1 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-64">
        <p className="text-gray-400 text-sm">Visualizador de arreglo (ArrayVisualizer)</p>
      </div>
    </div>
  );
}

// Vista del modulo de grafos con el lienzo interactivo
function GraphsPage() {
  const [mode, setMode] = useState<'BFS' | 'DFS'>('BFS');

  // Hook de reproduccion para las animaciones del grafo
  const { state, play, pause, stepBack, stepForward, setSpeed, reset } = usePlayback(0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Panel izquierdo de controles */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
        <GraphControls
          mode={mode}
          onModeChange={setMode}
          onGenerateTree={() => console.log('Generar Árbol')}
          onGenerateDense={() => console.log('Generar Denso')}
          onGenerateLinked={() => console.log('Generar Enlazado')}
        />
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

      {/* Lienzo principal del grafo */}
      <div className="flex-1">
        <GraphCanvas />
      </div>
    </div>
  );
}

// Configuracion principal de rutas
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
