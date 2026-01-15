"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    difficulty: string;
    order: number;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card difficulty={item.difficulty}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-zinc-500 text-xs">#{item.order}</span>
              <DifficultyBadge difficulty={item.difficulty} />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colorClasses = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    Hard: "text-red-400 bg-red-400/10 border-red-400/30",
  };
  
  const classes = colorClasses[difficulty as keyof typeof colorClasses] || colorClasses.Easy;
  
  return (
    <span
      className={`text-xs font-bold px-3 py-1 rounded-full border ${classes}`}
    >
      {difficulty}
    </span>
  );
};

export const Card = ({
  className,
  children,
  difficulty,
}: {
  className?: string;
  children: React.ReactNode;
  difficulty?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-5 overflow-hidden bg-black border border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-3 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
