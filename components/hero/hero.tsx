'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useDeviceCapability } from '@/hooks/use-device-capability';
import { PulseFallback } from './pulse-fallback';

// Three.js/R3F only ever reaches the client bundle for capable devices.
const PulseScene = dynamic(() => import('./pulse-scene'), { ssr: false, loading: () => <PulseFallback /> });

export function Hero() {
  const reducedMotion = useReducedMotion();
  const { isMobile, isLowPower, ready } = useDeviceCapability();
  const use3D = ready && !reducedMotion && !isLowPower;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="container flex flex-col items-center gap-8 py-16 md:flex-row md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-center md:text-left"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-raised px-3 py-1 font-mono text-xs text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" /> Live on YouTube
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            Every signal worth watching, in one current.
          </h1>
          <p className="mt-4 text-balance text-base text-muted md:text-lg">
            MAAR Pulse discovers real YouTube video, tuned to a calmer rhythm — search, watch and follow channels
            with a premium, distraction-free feed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="h-64 w-full shrink-0 md:h-80 md:w-1/2"
        >
          {use3D ? <PulseScene /> : <PulseFallback />}
        </motion.div>
      </div>
    </section>
  );
}
