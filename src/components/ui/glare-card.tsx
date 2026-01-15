"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const state = useRef({
    glare: { x: 50, y: 50 },
    background: { x: 50, y: 50 },
    rotate: { x: 0, y: 0 },
  });

  const updateStyles = () => {
    if (refElement.current) {
      const { background, rotate, glare } = state.current;
      refElement.current.style.setProperty("--m-x", `${glare.x}%`);
      refElement.current.style.setProperty("--m-y", `${glare.y}%`);
      refElement.current.style.setProperty("--r-x", `${rotate.x}deg`);
      refElement.current.style.setProperty("--r-y", `${rotate.y}deg`);
      refElement.current.style.setProperty("--bg-x", `${background.x}%`);
      refElement.current.style.setProperty("--bg-y", `${background.y}%`);
    }
  };

  return (
    <div
      ref={refElement}
      className="glare-card-wrapper"
      style={{
        "--m-x": "50%",
        "--m-y": "50%",
        "--r-x": "0deg",
        "--r-y": "0deg",
        "--bg-x": "50%",
        "--bg-y": "50%",
        "--duration": "300ms",
        "--opacity": "0",
        "--radius": "16px",
        "--easing": "ease",
      } as React.CSSProperties}
      onPointerMove={(event) => {
        const rotateFactor = 0.4;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const percentage = {
          x: (100 / rect.width) * position.x,
          y: (100 / rect.height) * position.y,
        };
        const delta = {
          x: percentage.x - 50,
          y: percentage.y - 50,
        };

        const { background, rotate, glare } = state.current;
        background.x = 50 + percentage.x / 4 - 12.5;
        background.y = 50 + percentage.y / 3 - 16.67;
        rotate.x = -(delta.x / 3.5) * rotateFactor;
        rotate.y = (delta.y / 2) * rotateFactor;
        glare.x = percentage.x;
        glare.y = percentage.y;

        updateStyles();
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        if (refElement.current) {
          setTimeout(() => {
            if (isPointerInside.current) {
              refElement.current?.style.setProperty("--duration", "0s");
            }
          }, 300);
        }
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        if (refElement.current) {
          refElement.current.style.removeProperty("--duration");
          refElement.current.style.setProperty("--r-x", "0deg");
          refElement.current.style.setProperty("--r-y", "0deg");
        }
      }}
    >
      <div className="glare-card-inner">
        <div className={cn("glare-card-content", className)}>
          {children}
        </div>
        <div className="glare-card-glare" />
        <div className="glare-card-foil" />
      </div>

      <style jsx>{`
        .glare-card-wrapper {
          position: relative;
          perspective: 600px;
          width: 100%;
          height: 100%;
        }
        
        .glare-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          transform-style: preserve-3d;
          transform: rotateY(var(--r-x)) rotateX(var(--r-y));
          transition: transform var(--duration) var(--easing);
          will-change: transform;
          border-radius: var(--radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        
        .glare-card-inner:hover {
          --opacity: 0.6;
        }
        
        .glare-card-content {
          grid-area: 1 / 1;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        }
        
        .glare-card-glare {
          grid-area: 1 / 1;
          width: 100%;
          height: 100%;
          mix-blend-mode: soft-light;
          opacity: var(--opacity);
          transition: opacity var(--duration) var(--easing);
          pointer-events: none;
          background: radial-gradient(
            farthest-corner circle at var(--m-x) var(--m-y),
            rgba(255, 255, 255, 0.8) 10%,
            rgba(255, 255, 255, 0.65) 20%,
            rgba(255, 255, 255, 0) 90%
          );
        }
        
        .glare-card-foil {
          grid-area: 1 / 1;
          width: 100%;
          height: 100%;
          mix-blend-mode: color-dodge;
          opacity: var(--opacity);
          transition: opacity var(--duration) var(--easing);
          pointer-events: none;
          background: 
            repeating-linear-gradient(
              0deg,
              rgb(255, 119, 115) calc(5% * 1),
              rgba(255, 237, 95, 1) calc(5% * 2),
              rgba(168, 255, 95, 1) calc(5% * 3),
              rgba(131, 255, 247, 1) calc(5% * 4),
              rgba(120, 148, 255, 1) calc(5% * 5),
              rgb(216, 117, 255) calc(5% * 6),
              rgb(255, 119, 115) calc(5% * 7)
            );
          background-position: 0% var(--bg-y);
          background-size: 200% 700%;
        }
      `}</style>
    </div>
  );
};
