"use client"

import { useState, useEffect } from 'react';

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const generateCount = () => Math.floor(Math.random() * (25 - 8 + 1)) + 8;
    
    // Initial count after mount to avoid hydration mismatch
    setCount(generateCount());

    const interval = setInterval(() => {
      setCount(generateCount());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (count === null) return <div className="h-[26px] mb-2" />; // Spacer

  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-dot-pulse" />
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <strong className="text-foreground">{count}</strong> mamães olhando agora
      </span>
    </div>
  );
}
