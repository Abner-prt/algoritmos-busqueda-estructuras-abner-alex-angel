import { Outlet, Link } from 'react-router-dom';
import { Network, Search, Home } from 'lucide-react';

// Componente principal de diseno y navegacion
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de navegacion superior */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Home className="w-6 h-6" />
            Inicio
          </Link>
          
          {/* Enlaces a las diferentes secciones */}
          <nav className="flex gap-4">
            <Link to="/search" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
              <Search className="w-5 h-5" />
              Busqueda
            </Link>
            <Link to="/graphs" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
              <Network className="w-5 h-5" />
              Grafos
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenedor dinamico de las rutas */}
      <main className="flex-1 flex flex-col p-4">
        <Outlet />
      </main>
    </div>
  );
}
