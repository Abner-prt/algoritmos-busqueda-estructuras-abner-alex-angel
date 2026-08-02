import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from 'lucide-react';
import type { PlaybackState } from '../../types/animation';

interface PlaybackControlsProps {
  state: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

// Componente maestro de controles de reproduccion
export function PlaybackControls({
  state,
  onPlay,
  onPause,
  onStepBack,
  onStepForward,
  onSpeedChange,
  onReset,
}: PlaybackControlsProps) {

  // Convierte el valor del slider a milisegundos reales (inverso)
  const sliderToSpeed = (val: number) => Math.round(1100 - val * 10);
  const speedToSlider = (ms: number) => Math.round((1100 - ms) / 10);

  return (
    <div className="bg-white rounded-xl shadow-lg border p-4 flex flex-col gap-4 w-full">

      {/* Indicador de progreso del paso actual */}
      <div className="flex justify-between text-sm text-gray-500 px-1">
        <span>Paso {state.currentStep + 1}</span>
        <span>Total {state.totalSteps}</span>
      </div>

      {/* Barra de progreso visual */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
          style={{
            width: state.totalSteps > 0
              ? `${((state.currentStep + 1) / state.totalSteps) * 100}%`
              : '0%'
          }}
        />
      </div>

      {/* Botones principales de reproduccion */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          title="Reiniciar"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onStepBack}
          disabled={state.currentStep === 0}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-30"
          title="Paso atras"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        {/* Boton principal de play y pause */}
        <button
          onClick={state.isPlaying ? onPause : onPlay}
          disabled={state.totalSteps === 0}
          className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors disabled:opacity-30"
          title={state.isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {state.isPlaying
            ? <Pause className="w-7 h-7" />
            : <Play className="w-7 h-7 ml-0.5" />
          }
        </button>

        <button
          onClick={onStepForward}
          disabled={state.currentStep >= state.totalSteps - 1}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-30"
          title="Paso adelante"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Control deslizante de velocidad */}
      <div className="flex items-center gap-3 px-2">
        <Gauge className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="range"
          min="1"
          max="100"
          value={speedToSlider(state.speed)}
          onChange={e => onSpeedChange(sliderToSpeed(Number(e.target.value)))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
          {speedToSlider(state.speed)}
        </span>
      </div>
    </div>
  );
}
