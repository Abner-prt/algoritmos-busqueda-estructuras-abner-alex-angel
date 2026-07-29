import type { SearchStep, ElementState } from '../../types/search';

interface ArrayVisualizerProps {
  currentStep: SearchStep;
}

const stateStyles: Record<ElementState, string> = {
  idle: 'bg-gray-200 text-gray-700 border-gray-300',
  comparing: 'bg-yellow-400 text-yellow-900 border-yellow-500 scale-110 shadow-lg shadow-yellow-400/40',
  match: 'bg-green-400 text-green-950 border-green-500 scale-115 shadow-lg shadow-green-400/50 ring-2 ring-green-300',
  discarded: 'bg-red-900/60 text-red-300 border-red-800 opacity-50 scale-95',
  inRange: 'bg-blue-200 text-blue-800 border-blue-400',
};
const pointerColors: Record<string, string> = {
  i: 'bg-orange-500 text-white',
  L: 'bg-cyan-500 text-white',
  R: 'bg-purple-500 text-white',
  Mid: 'bg-pink-500 text-white',
  left: 'bg-cyan-500 text-white',
  right: 'bg-purple-500 text-white',
  mid: 'bg-pink-500 text-white',
};
function getPointersAtIndex(
  pointers: Record<string, number>,
  index: number
): string[] {
  const labels: string[] = [];
  for (const [key, value] of Object.entries(pointers)) {
    if (value === index && value !== -1) {
      labels.push(key);
    }
  }
  return labels;
}

export default function ArrayVisualizer({ currentStep }: ArrayVisualizerProps) {
  const { array, pointers, description, found } = currentStep;

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      <div className="flex flex-wrap justify-center gap-3">
        {array.map((element, index) => {
          const pointersHere = getPointersAtIndex(pointers, index);

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex gap-1 min-h-[24px] items-end">
                {pointersHere.map((label) => (
                  <span
                    key={label}
                    className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded-md
                      ${pointerColors[label] || 'bg-gray-500 text-white'}
                      animate-bounce
                    `}
                  >
                    {label.toUpperCase()}
                  </span>
                ))}
              </div>
              <div
                className={`
                  relative flex items-center justify-center
                  w-14 h-14 rounded-xl border-2 font-bold text-lg
                  transition-all duration-300 ease-in-out
                  ${stateStyles[element.state]}
                `}
              >
                {element.value}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                [{index}]
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={`
          w-full max-w-2xl text-center text-sm px-4 py-2.5 rounded-lg border
          ${found === true
            ? 'bg-green-950/30 border-green-700 text-green-300'
            : found === false
              ? 'bg-red-950/30 border-red-700 text-red-300'
              : 'bg-gray-800/50 border-gray-700 text-gray-300'
          }
        `}
      >
        {description}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" />
          <span>Inactivo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-500" />
          <span>Comparando</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-400 border border-green-500" />
          <span>Encontrado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-900/60 border border-red-800" />
          <span>Descartado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-200 border border-blue-400" />
          <span>En rango</span>
        </div>
      </div>
    </div>
  );
}
