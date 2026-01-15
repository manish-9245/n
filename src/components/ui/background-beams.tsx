"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 bg-neutral-950",
        className
      )}
    >
      <div className="absolute h-full w-full bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute inset-0 bg-[url('https://aceternity.com/images/products/thumbnails/new/grid.png')] opacity-20" />
    </div>
  );
};
