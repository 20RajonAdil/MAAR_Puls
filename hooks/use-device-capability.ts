'use client';

import { useEffect, useState } from 'react';

interface DeviceCapability {
  isMobile: boolean;
  isLowPower: boolean;
  ready: boolean;
}

/**
 * Heuristic check used to decide whether to render the full 3D hero scene
 * or a lightweight CSS/SVG fallback. Errs toward the fallback when unsure —
 * a missed 3D flourish is cheap, a janky scroll on a budget phone is not.
 */
export function useDeviceCapability(): DeviceCapability {
  const [state, setState] = useState<DeviceCapability>({
    isMobile: false,
    isLowPower: false,
    ready: false,
  });

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const cores = (navigator as any).hardwareConcurrency ?? 8;
    const memory = (navigator as any).deviceMemory ?? 8;
    const isLowPower = cores <= 4 || memory <= 4;
    setState({ isMobile, isLowPower, ready: true });
  }, []);

  return state;
}
