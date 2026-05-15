/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface OrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  cameraStream?: MediaStream | null;
}

export default function Orb({ state, cameraStream }: OrbProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const getGlowColor = () => {
    switch (state) {
      case 'listening': return 'rgba(59, 130, 246, 0.8)'; // Blue
      case 'thinking': return 'rgba(147, 51, 234, 0.8)'; // Purple
      case 'speaking': return 'rgba(34, 211, 238, 0.8)'; // Cyan
      default: return 'rgba(59, 130, 246, 0.4)'; // Dim Blue
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Rings */}
      <motion.div
        animate={{
          rotate: 360,
          scale: state === 'listening' ? [1, 1.1, 1] : 1,
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
        className="absolute w-full h-full border-2 border-dashed rounded-full"
        style={{ borderColor: getGlowColor(), opacity: 0.3 }}
      />

      <motion.div
        animate={{
          rotate: -360,
          scale: state === 'speaking' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity }
        }}
        className="absolute w-4/5 h-4/5 border border-dotted rounded-full"
        style={{ borderColor: getGlowColor(), opacity: 0.5 }}
      />

      {/* Core */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [0.9, 1.1, 0.9] : [1, 1.05, 1],
          boxShadow: `0 0 40px ${getGlowColor()}`,
        }}
        transition={{
          duration: state === 'thinking' ? 1.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 w-32 h-32 overflow-hidden bg-black border-4 rounded-full flex items-center justify-center"
        style={{ borderColor: getGlowColor() }}
      >
        {/* Camera Feed */}
        {cameraStream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-125 contrast-125 mix-blend-screen opacity-80"
          />
        )}

        {/* Glow inner */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)` }}
        />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />
        
        {/* Active Wave Effect */}
        {state !== 'idle' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '-100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-20"
            style={{ 
              background: `linear-gradient(to top, transparent, ${getGlowColor()}, transparent)`,
              opacity: 0.2
            }}
          />
        )}
      </motion.div>

      {/* Dynamic Status Text */}
      <div className="absolute top-full mt-8 text-center uppercase tracking-[0.2em] font-mono text-xs">
        <span className="opacity-50">Status: </span>
        <motion.span
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: getGlowColor() }}
        >
          {state}
        </motion.span>
      </div>
    </div>
  );
}
