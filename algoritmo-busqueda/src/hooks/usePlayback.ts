import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlaybackState } from '../types/animation';

// Hook que controla la reproduccion de animaciones paso a paso
export function usePlayback(totalSteps: number) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps,
    speed: 500,
  });

  // Referencia al intervalo para poder limpiarlo
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpia el intervalo activo
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Avanza un paso automaticamente segun la velocidad configurada
  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.currentStep >= prev.totalSteps - 1) {
            clearTimer();
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, state.speed);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [state.isPlaying, state.speed, clearTimer]);

  // Actualiza el total de pasos cuando cambia el arreglo
  useEffect(() => {
    // TODO: fix this eslint warning
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({
      ...prev,
      totalSteps,
      currentStep: 0,
      isPlaying: false,
    }));
  }, [totalSteps]);

  // Inicia la reproduccion
  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Pausa la reproduccion
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Retrocede un paso
  const stepBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Avanza un paso
  const stepForward = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: Math.min(prev.totalSteps - 1, prev.currentStep + 1),
    }));
  }, []);

  // Cambia la velocidad de reproduccion
  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  // Reinicia la animacion al paso inicial
  const reset = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
  }, []);

  return { state, play, pause, stepBack, stepForward, setSpeed, reset };
}
