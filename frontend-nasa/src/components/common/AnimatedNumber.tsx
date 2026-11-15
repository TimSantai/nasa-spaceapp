import React, { useEffect, useRef, useState } from 'react';
import { interpolateValue, formatAnimatedNumber } from '../../lib/animationUtils';

export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  className = '',
  duration = 380,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;

    if (start === end) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const raf = requestAnimationFrame(() => {
        prevValueRef.current = end;
        setDisplayValue(end);
      });
      return () => cancelAnimationFrame(raf);
    }

    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = interpolateValue(start, end, progress);
      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
        setDisplayValue(end);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return <span className={className}>{formatAnimatedNumber(displayValue, decimals)}</span>;
};
