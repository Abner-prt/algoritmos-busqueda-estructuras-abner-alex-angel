import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PlaybackControls } from './components/controls/PlaybackControls';

// Vista temporal de inicio
function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Estructuras de Datos</h1>
      <p className="text-lg text-gray-600 mb-8">Algoritmos de Busqueda y Grafos</p>
      
      <div className="flex gap-4 mb-12">
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Busqueda Lineal
        </button>
        <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
          Grafos
        </button>
      </div>
    </div>
  );
}

// Vista temporal para busqueda
function SearchPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold mb-8">Modulo de Busqueda</h2>
      <PlaybackControls />
    </div>
  );
}

// Vista temporal para grafos
function GraphsPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold mb-8">Modulo de Grafos</h2>
      <PlaybackControls />
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
