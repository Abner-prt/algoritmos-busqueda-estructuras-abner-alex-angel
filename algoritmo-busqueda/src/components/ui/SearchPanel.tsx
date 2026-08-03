import { useState } from 'react';
import { Search, ListOrdered, Hash } from 'lucide-react';
import type { SearchConfig } from '../../types/search';

interface SearchPanelProps {
  onSearch: (config: SearchConfig) => void;
  logs: string[];
}

// Panel de entradas y configuracion para la busqueda
export function SearchPanel({ onSearch, logs }: SearchPanelProps) {
  const [arrayInput, setArrayInput] = useState('');
  const [target, setTarget] = useState('');
  const [algorithm, setAlgorithm] = useState<'linear' | 'binary'>('linear');
  const [error, setError] = useState('');

  // Valida y procesa el arreglo ingresado por el usuario
  const handleSubmit = () => {
    setError('');

    const parsed = arrayInput
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));

    if (parsed.length === 0) {
      setError('Ingresa al menos un numero valido');
      return;
    }

    const targetNum = Number(target);
    if (isNaN(targetNum)) {
      setError('El valor a buscar debe ser un numero');
      return;
    }

    onSearch({ array: parsed, target: targetNum, algorithm });
  };

  const handleAlgorithmChange = (newAlg: 'linear' | 'binary') => {
    setAlgorithm(newAlg);
    
    // Auto-ejecutar búsqueda si hay datos válidos (evitar que cajas vacías se conviertan en 0)
    if (arrayInput.trim() === '' || target.trim() === '') return;

    const parsed = arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const targetNum = Number(target);
    if (parsed.length > 0 && !isNaN(targetNum)) {
      onSearch({ array: parsed, target: targetNum, algorithm: newAlg });
      setError('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border p-5 flex flex-col gap-5 w-full">

      {/* Selector de tipo de algoritmo */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAlgorithmChange('linear')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            algorithm === 'linear'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Busqueda Lineal
        </button>
        <button
          onClick={() => handleAlgorithmChange('binary')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            algorithm === 'binary'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Busqueda Binaria
        </button>
      </div>

      {/* Campo para ingresar los elementos del arreglo */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <ListOrdered className="w-4 h-4" />
          Arreglo (separado por comas)
        </label>
        <input
          type="text"
          value={arrayInput}
          onChange={e => {
            const val = e.target.value;
            // Solo permite números, comas, espacios y el signo menos
            if (/^[0-9, \-]*$/.test(val)) {
              setArrayInput(val);
            }
          }}
          placeholder="Ej: 10, 25, 37, 42, 58"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Campo para ingresar el valor objetivo */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Hash className="w-4 h-4" />
          Valor a buscar
        </label>
        <input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Ej: 42"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Mensaje de error si la entrada es invalida */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Boton para iniciar la busqueda */}
      <button
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      >
        <Search className="w-4 h-4" />
        Iniciar busqueda
      </button>

      {/* Panel de registros de cada paso */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-700">Registro de pasos</p>
          <div className="bg-gray-50 rounded-lg border p-3 max-h-36 overflow-y-auto flex flex-col gap-1">
            {logs.map((log, i) => (
              <p key={i} className="text-xs text-gray-600">
                <span className="text-blue-400 font-mono mr-1">[{i + 1}]</span>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
