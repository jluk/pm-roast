"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoloCard({ children, className = "" }: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    scale: 1,
  });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    // Calculate glare position (0-100%)
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      rotateX,
      rotateY,
      glareX,
      glareY,
      scale: 1.05,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setStyle({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      scale: 1,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div
      className={`perspective-1000 ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        animate={{
          rotateX: style.rotateX,
          rotateY: style.rotateY,
          scale: style.scale,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="relative transform-gpu"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Holographic rainbow gradient overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-20 mix-blend-color-dodge opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 0.7 : 0,
            backgroundImage: `
              linear-gradient(
                ${115 + style.rotateY * 2}deg,
                rgba(255, 0, 128, 0.4) 0%,
                rgba(255, 140, 0, 0.4) 17%,
                rgba(255, 255, 0, 0.4) 33%,
                rgba(0, 255, 128, 0.4) 50%,
                rgba(0, 200, 255, 0.4) 67%,
                rgba(128, 0, 255, 0.4) 83%,
                rgba(255, 0, 128, 0.4) 100%
              )
            `,
            backgroundPosition: `${style.glareX}% ${style.glareY}%`,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Glare/shine effect */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            backgroundImage: `
              radial-gradient(
                circle at ${style.glareX}% ${style.glareY}%,
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 0.1) 20%,
                transparent 50%
              )
            `,
          }}
        />

        {/* Sparkle/glitter texture overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-10 opacity-0 transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: isHovering ? 0.5 : 0,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 80% 20%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 40% 70%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 60% 50%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 10% 80%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 90% 60%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 30% 10%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 70% 90%, white 0.5px, transparent 0.5px)
              `,
              backgroundSize: "100% 100%",
              transform: `translate(${(style.glareX - 50) * 0.2}px, ${(style.glareY - 50) * 0.2}px)`,
              filter: "blur(0.3px)",
            }}
          />
        </div>

        {/* Card content */}
        {children}

        {/* Edge lighting effect */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-0"
          style={{
            boxShadow: isHovering
              ? `
                  ${style.rotateY * 2}px ${style.rotateX * -2}px 20px rgba(255, 255, 255, 0.1),
                  ${style.rotateY * 4}px ${style.rotateX * -4}px 40px rgba(99, 102, 241, 0.2),
                  0 0 60px rgba(139, 92, 246, 0.3)
                `
              : "0 0 20px rgba(99, 102, 241, 0.2)",
            transition: "box-shadow 0.3s ease",
          }}
        />
      </motion.div>
    </div>
  );
}
