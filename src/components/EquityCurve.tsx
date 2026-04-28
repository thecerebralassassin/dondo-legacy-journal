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
    const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
    let currentEquity = Number(startingBalance) || 0;
    
    const points = [{ x: 0, y: currentEquity }];
    
    sorted.forEach((t, i) => {
      const pnl = t.pnl || 0;
      currentEquity += (isZar ? pnl * usdZarRate : pnl);
      points.push({ x: i + 1, y: currentEquity });
    });
    
    return points;
  }, [trades, startingBalance, isZar, usdZarRate]);

  if (dataPoints.length < 2) return null;

  const minVal = Math.min(...dataPoints.map(p => p.y));
  const maxVal = Math.max(...dataPoints.map(p => p.y));
  const range = maxVal - minVal || 100;
  
  const padding = range * 0.1;
  const bottom = minVal - padding;
  const top = maxVal + padding;
  const heightRange = top - bottom;

  const width = 1000;
  const height = 200;

  const pointsString = dataPoints.map((p, i) => {
    const x = (i / (dataPoints.length - 1)) * width;
    const y = height - ((p.y - bottom) / heightRange) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full h-24 mt-6 relative opacity-50">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dondo-emerald)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--dondo-emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path
          d={`M 0,${height} L ${pointsString} L ${width},${height} Z`}
          fill="url(#curveGradient)"
        />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--dondo-emerald)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsString}
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        />
      </svg>
    </div>
  );
}
