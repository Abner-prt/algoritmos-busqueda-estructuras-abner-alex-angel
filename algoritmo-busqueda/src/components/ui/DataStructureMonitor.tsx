import { useRef, useState } from 'react';

// Pila LIFO 
class Pila<T> {
  private elementos: T[] = [];

  apilar(item: T): void { this.elementos.push(item); }
  desapilar(): T | undefined { return this.elementos.pop(); }
  verTope(): T | undefined { return this.elementos[this.elementos.length - 1]; }
  estaVacia(): boolean { return this.elementos.length === 0; }
  tamaño(): number { return this.elementos.length; }
  limpiar(): void { this.elementos = []; }
  listar(): T[] { return [...this.elementos]; }
}

// Cola FIFO
class Cola<T> {
  private elementos: T[] = [];

  encolar(item: T): void { this.elementos.push(item); }
  desencolar(): T | undefined { return this.elementos.shift(); }
  verFrente(): T | undefined { return this.elementos[0]; }
  estaVacia(): boolean { return this.elementos.length === 0; }
  tamaño(): number { return this.elementos.length; }
  limpiar(): void { this.elementos = []; }
  listar(): T[] { return [...this.elementos]; }
}

interface DataStructureMonitorProps {
  modo: 'pila' | 'cola';
  elementos?: string[];
  titulo?: string;
}

// useRef para la estructura, useState para sincronizar el render
export const DataStructureMonitor = ({ modo, elementos: elementosExternos, titulo }: DataStructureMonitorProps) => {
  const pilaRef = useRef(new Pila<string>());
  const colaRef = useRef(new Cola<string>());
  const [elementosInternos, setElementosInternos] = useState<string[]>([]);
  const [resultado, setResultado] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const elementos = elementosExternos ?? elementosInternos;

  const sincronizar = () => {
    if (modo === 'pila') {
      setElementosInternos(pilaRef.current.listar().reverse());
    } else {
      setElementosInternos(colaRef.current.listar());
    }
  };

  const handleAgregar = () => {
    const valor = input.trim();
    if (!valor) return;

    if (modo === 'pila') {
      pilaRef.current.apilar(valor);
      setResultado(`apilar("${valor}")`);
    } else {
      colaRef.current.encolar(valor);
      setResultado(`encolar("${valor}")`);
    }
    setInput('');
    sincronizar();
  };

  const handleRetirar = () => {
    if (modo === 'pila') {
      const retirado = pilaRef.current.desapilar();
      setResultado(
        retirado !== undefined
          ? `desapilar() → "${retirado}"`
          : 'desapilar() → Pila vacía'
      );
    } else {
      const retirado = colaRef.current.desencolar();
      setResultado(
        retirado !== undefined
          ? `desencolar() → "${retirado}"`
          : 'desencolar() → Cola vacía'
      );
    }
    sincronizar();
  };

  const handleVerPrimero = () => {
    if (modo === 'pila') {
      const tope = pilaRef.current.verTope();
      setResultado(
        tope !== undefined
          ? `verTope() → "${tope}" (sin remover)`
          : 'verTope() → Pila vacía'
      );
    } else {
      const frente = colaRef.current.verFrente();
      setResultado(
        frente !== undefined
          ? `verFrente() → "${frente}" (sin remover)`
          : 'verFrente() → Cola vacía'
      );
    }
  };

  const handleLimpiar = () => {
    if (modo === 'pila') {
      pilaRef.current.limpiar();
      setResultado('limpiar() → Pila vacía');
    } else {
      colaRef.current.limpiar();
      setResultado('limpiar() → Cola vacía');
    }
    sincronizar();
  };

  const esModoLectura = elementosExternos !== undefined;

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 420, padding: 24 }}>
      <h3 style={{ margin: '0 0 12px 0' }}>
        {titulo ?? (modo === 'pila' ? 'Pila (LIFO)' : 'Cola (FIFO)')}
      </h3>

      {!esModoLectura && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
              style={{ padding: '6px 8px', width: 120, fontSize: 13 }}
              type="text"
              placeholder={modo === 'pila' ? 'apilar...' : 'encolar...'}
            />
            <button onClick={handleAgregar}>
              {modo === 'pila' ? 'apilar()' : 'encolar()'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <button onClick={handleRetirar}>
              {modo === 'pila' ? 'desapilar()' : 'desencolar()'}
            </button>
            <button onClick={handleVerPrimero}>
              {modo === 'pila' ? 'verTope()' : 'verFrente()'}
            </button>
            <button onClick={handleLimpiar}>limpiar()</button>
          </div>
        </>
      )}

      {resultado && (
        <div style={{
          backgroundColor: '#f1f3f5',
          padding: '6px 10px',
          borderLeft: '3px solid #228be6',
          fontSize: 13,
          marginBottom: 12,
        }}>
          {resultado}
        </div>
      )}

      <div style={{ fontSize: 13, marginBottom: 12, color: '#555' }}>
        tamaño(): <strong>{elementos.length}</strong>
      </div>

      <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 140 }}>
        {modo === 'pila' && (
          <div style={{ fontSize: 11, color: '#868e96', paddingBottom: 3, borderBottom: '2px solid #868e96' }}>
            ↓ TOPE
          </div>
        )}

        {modo === 'cola' && (
          <div style={{ fontSize: 11, color: '#228be6', paddingBottom: 3 }}>
            ← FRENTE (sale primero)
          </div>
        )}

        {elementos.length === 0 ? (
          <div style={{ color: '#dee3e6', padding: 8 }}>
            ({modo === 'pila' ? 'Pila' : 'Cola'} vacía)
          </div>
        ) : (
          elementos.map((el, i) => (
            <div
              key={i}
              style={{
                padding: '6px 10px',
                border: '1px solid #dee2e6',
                borderBottom: i === elementos.length - 1 ? '1px solid #dee2e6' : 'none',
                backgroundColor: i === 0 ? '#e7f5ff' : '#fff',
                fontSize: 14,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span>{el}</span>
              {modo === 'pila' && i === 0 && (
                <span style={{ color: '#228be6', fontSize: 11 }}>TOPE</span>
              )}
              {modo === 'cola' && i === 0 && (
                <span style={{ color: '#228be6', fontSize: 11 }}>FRENTE</span>
              )}
              {modo === 'cola' && i === elementos.length - 1 && (
                <span style={{ color: '#868e96', fontSize: 11 }}>FINAL</span>
              )}
            </div>
          ))
        )}

        {modo === 'pila' && (
          <div style={{
            borderTop: '2px solid #868e96',
            fontSize: 11,
            color: '#868e96',
            paddingTop: 3,
          }}>
            0 fondo
          </div>
        )}
      </div>
    </div>
  );
};
