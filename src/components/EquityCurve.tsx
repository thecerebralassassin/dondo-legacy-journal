"use client";

import { useMemo } from "react";
import { Trade } from "@/context/AppContext";

export default function EquityCurve({ trades, startingBalance, isZar, usdZarRate }: { 
  trades: Trade[], 
  startingBalance: number, 
  isZar: boolean, 
  usdZarRate: number 
}) {
  const dataPoints = useMemo(() => {
    // Sort trades by date
    const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
    let currentEquity = Number(startingBalance) || 0;
    
    // Initial point
    const points = [{ x: 0, y: currentEquity }];
    
    sorted.forEach((t, i) => {
      const pnl = t.pnl || 0;
      currentEquity += (isZar ? pnl * usdZarRate : pnl);
      points.push({ x: i + 1, y: currentEquity });
    });

    // If no trades, add a flat line for visual
    if (points.length === 1) {
       points.push({ x: 1, y: currentEquity });
    }
    
    return points;
  }, [trades, startingBalance, isZar, usdZarRate]);

  const minVal = Math.min(...dataPoints.map(p => p.y));
  const maxVal = Math.max(...dataPoints.map(p => p.y));
  const range = maxVal - minVal || 100;
  
  const padding = range * 0.2;
  const bottom = minVal - padding;
  const top = maxVal + padding;
  const heightRange = top - bottom;

  const width = 1000;
  const height = 200;

  // Generate path for the line
  const pointsString = dataPoints.map((p, i) => {
    const x = (i / (dataPoints.length - 1)) * width;
    const y = height - ((p.y - bottom) / heightRange) * height;
    return `${x},${y}`;
  }).join(" L ");

  const linePath = `M ${pointsString}`;
  const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-full relative pointer-events-none select-none overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dondo-emerald)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--dondo-emerald)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Fill Area */}
        <path
          d={fillPath}
          fill="url(#curveGradient)"
          className="transition-all duration-1000"
        />
        
        {/* Glowing Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--dondo-emerald)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
        />
      </svg>
    </div>
  );
}
