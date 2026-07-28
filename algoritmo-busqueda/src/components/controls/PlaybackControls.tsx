import { Play, Pause, SkipBack, SkipForward, FastForward } from 'lucide-react';

// Componente maestro de controles de animacion
export function PlaybackControls() {
  return (
    <div className="bg-white rounded-xl shadow-lg border p-4 flex flex-col gap-4 w-full max-w-md mx-auto">
      {/* Botones principales de reproduccion */}
      <div className="flex items-center justify-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>
        <button className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors">
          <Play className="w-8 h-8 ml-1" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <Pause className="w-6 h-6" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Control deslizante de velocidad */}
      <div className="flex items-center gap-3 px-4">
        <FastForward className="w-5 h-5 text-gray-500" />
        <input 
          type="range" 
          min="1" 
          max="100" 
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
