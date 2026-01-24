"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className = "",
  colors = ["#60a5fa", "#a78bfa", "#f472b6", "#60a5fa"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: "300% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `gradient-shift ${animationSpeed}s ease infinite`,
      }}
    >
      {showBorder && (
        <span
          className="absolute inset-0 rounded-lg -z-10"
          style={{
            backgroundImage: gradient,
            backgroundSize: "300% 100%",
            animation: `gradient-shift ${animationSpeed}s ease infinite`,
            padding: "2px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />
      )}
      {children}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </span>
  );
}
