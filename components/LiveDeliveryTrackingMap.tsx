import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DeliveryOrderInfo {
  orderId: string;
  customerName: string;
  customerAddress: string;
  darkStoreName: string;
  darkStoreAddress: string;
  riderName: string;
  riderVehicle: string;
  riderRating: number;
  riderPhone: string;
  totalDistanceKm: number;
  estimatedMinutesInitial: number;
}

export interface LiveDeliveryTrackingMapProps {
  /** Flag to activate/render the delivery map tracking view */
  isDelivering: boolean;
  /** Optional custom order data */
  orderInfo?: Partial<DeliveryOrderInfo>;
  /** Total animation duration in seconds for rider to travel from A to B (10 to 15s) */
  animationDurationSeconds?: number;
  /** Callback triggered when the rider arrives at destination */
  onDeliveryComplete?: () => void;
  /** Callback to reset or restart the simulation flow */
  onReset?: () => void;
}

const DEFAULT_DELIVERY_INFO: DeliveryOrderInfo = {
  orderId: 'CSN-MOB-4821',
  customerName: 'Neel Belsare',
  customerAddress: 'Flat 402, Rohan Mithila, Viman Nagar, Pune',
  darkStoreName: 'Dark Store Hub #03 - Viman Central',
  darkStoreAddress: 'Symbiosis Road, Sector 2, Viman Nagar',
  riderName: 'Rahul Sharma',
  riderVehicle: 'Bajaj Chetak EV • MH 20 BY 4821',
  riderRating: 4.96,
  riderPhone: '+91 98230 44821',
  totalDistanceKm: 1.8,
  estimatedMinutesInitial: 8,
};

// SVG Path Definition connecting Point A (Dark Store: 120, 480) to Point B (Customer: 780, 110)
// Designed along grid avenue intersections for realistic city street routing
const ROUTE_PATH_D =
  'M 120 480 L 260 480 Q 280 480 280 460 L 280 340 Q 280 320 300 320 L 460 320 Q 480 320 480 300 L 480 200 Q 480 180 500 180 L 680 180 Q 700 180 710 170 L 780 110';

// Coordinates for Point A and Point B
const POINT_A = { x: 120, y: 480, label: 'Dark Store Hub #03' };
const POINT_B = { x: 780, y: 110, label: 'Customer Destination' };

// ============================================================================
// Main Component: LiveDeliveryTrackingMap
// ============================================================================

export const LiveDeliveryTrackingMap: React.FC<LiveDeliveryTrackingMapProps> = ({
  isDelivering,
  orderInfo,
  animationDurationSeconds = 12, // 12 seconds (within 10-15s requirement)
  onDeliveryComplete,
  onReset,
}) => {
  const info: DeliveryOrderInfo = { ...DEFAULT_DELIVERY_INFO, ...orderInfo };

  // Route animation states
  const [progress, setProgress] = useState<number>(0); // 0.0 to 1.0
  const [riderCoords, setRiderCoords] = useState<{ x: number; y: number; angle: number }>({
    x: POINT_A.x,
    y: POINT_A.y,
    angle: 0,
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasArrived, setHasArrived] = useState<boolean>(false);

  // SVG Path Reference to measure exact geometry via getPointAtLength()
  const pathRef = useRef<SVGPathElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef<number>(0);

  // Reset & start animation loop when isDelivering flips to true
  useEffect(() => {
    if (!isDelivering) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setProgress(0);
      setHasArrived(false);
      setIsPaused(false);
      pausedProgressRef.current = 0;
      setRiderCoords({ x: POINT_A.x, y: POINT_A.y, angle: 0 });
      return;
    }

    // Initialize coordinate at start of path
    if (pathRef.current) {
      const p = pathRef.current.getPointAtLength(0);
      setRiderCoords({ x: p.x, y: p.y, angle: 0 });
    }

    startTimeRef.current = performance.now();
    const durationMs = animationDurationSeconds * 1000;

    const animateRider = (currentTime: number) => {
      if (isPaused) {
        animFrameRef.current = requestAnimationFrame(animateRider);
        return;
      }

      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const currentProgress = Math.min(1, pausedProgressRef.current + elapsed / durationMs);

      setProgress(currentProgress);

      if (pathRef.current) {
        const totalLength = pathRef.current.getTotalLength();
        const currentDist = currentProgress * totalLength;
        const pt = pathRef.current.getPointAtLength(currentDist);

        // Compute tangent angle for natural vehicle heading orientation
        const lookAheadDist = Math.min(totalLength, currentDist + 3);
        const lookAheadPt = pathRef.current.getPointAtLength(lookAheadDist);
        const deltaX = lookAheadPt.x - pt.x;
        const deltaY = lookAheadPt.y - pt.y;
        const deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        setRiderCoords({
          x: pt.x,
          y: pt.y,
          angle: deg,
        });
      }

      if (currentProgress < 1) {
        animFrameRef.current = requestAnimationFrame(animateRider);
      } else {
        setHasArrived(true);
        if (onDeliveryComplete) onDeliveryComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(animateRider);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDelivering, animationDurationSeconds, isPaused, onDeliveryComplete]);

  // Restart trip
  const restartTrip = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setProgress(0);
    setHasArrived(false);
    setIsPaused(false);
    pausedProgressRef.current = 0;
    startTimeRef.current = performance.now();
    if (pathRef.current) {
      const p = pathRef.current.getPointAtLength(0);
      setRiderCoords({ x: p.x, y: p.y, angle: 0 });
    }
    const durationMs = animationDurationSeconds * 1000;

    const animateRider = (currentTime: number) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / durationMs);
      setProgress(currentProgress);

      if (pathRef.current) {
        const totalLength = pathRef.current.getTotalLength();
        const currentDist = currentProgress * totalLength;
        const pt = pathRef.current.getPointAtLength(currentDist);
        const lookAheadPt = pathRef.current.getPointAtLength(Math.min(totalLength, currentDist + 3));
        const deg = Math.atan2(lookAheadPt.y - pt.y, lookAheadPt.x - pt.x) * (180 / Math.PI);

        setRiderCoords({ x: pt.x, y: pt.y, angle: deg });
      }

      if (currentProgress < 1) {
        animFrameRef.current = requestAnimationFrame(animateRider);
      } else {
        setHasArrived(true);
        if (onDeliveryComplete) onDeliveryComplete();
      }
    };
    animFrameRef.current = requestAnimationFrame(animateRider);
  };

  // Dynamic Telemetry Calculations
  const remainingDistanceKm = Math.max(0, (1 - progress) * info.totalDistanceKm).toFixed(2);
  const remainingSecondsTotal = (1 - progress) * (info.estimatedMinutesInitial * 60);

  // Live ETA text logic
  let etaText = `${Math.ceil(remainingSecondsTotal / 60)} mins`;
  if (hasArrived || progress >= 0.98) {
    etaText = 'Arriving Now! 🎉';
  } else if (progress > 0.85) {
    etaText = 'Under 1 min (At Gate)';
  } else if (progress > 0.6) {
    etaText = '3 mins (Nearby)';
  } else if (progress > 0.3) {
    etaText = '5 mins (En Route)';
  }

  // Calculate SVG strokeDashoffset for progress trail along the route
  const pathTotalLength = pathRef.current ? pathRef.current.getTotalLength() : 1000;
  const traveledStrokeLength = progress * pathTotalLength;

  return (
    <AnimatePresence>
      {isDelivering && (
        <motion.div
          key="live-tracking-map-container"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full h-[640px] md:h-[720px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl shadow-emerald-500/10 select-none font-sans text-slate-100"
        >
          {/* ================================================================= */}
          {/* Top Bar Status Indicator                                          */}
          {/* ================================================================= */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-2 shadow-lg pointer-events-auto">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                  Live GPS Dispatch
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 ml-2">
                  • Order #{info.orderId}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2 pointer-events-auto">
              <button
                onClick={restartTrip}
                className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg transition active:scale-95"
                title="Replay rider route"
              >
                🔄 Replay Route
              </button>
              {onReset && (
                <button
                  onClick={onReset}
                  className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg transition active:scale-95"
                  title="Back to Dashboard"
                >
                  ✕ Close Map
                </button>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* Simulated Dark-Mode Vector City Map Canvas                        */}
          {/* ================================================================= */}
          <div className="absolute inset-0 w-full h-full">
            <svg
              viewBox="0 0 900 600"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* City Grid Grid Pattern */}
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
                </pattern>

                {/* Road Glow Filter */}
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Point A Pulse Gradient */}
                <radialGradient id="hub-pulse-grad">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>

                {/* Point B Destination Gradient */}
                <radialGradient id="dest-pulse-grad">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base Background Fill */}
              <rect width="900" height="600" fill="#090d16" />

              {/* Street Matrix Grid Texture */}
              <rect width="900" height="600" fill="url(#street-grid)" />

              {/* City Waterway / Canal (Aesthetic Geographic Feature) */}
              <path
                d="M 0 160 Q 240 240 450 140 T 900 220 L 900 280 Q 640 200 450 200 T 0 220 Z"
                fill="#071b2e"
                opacity="0.7"
              />
              <path
                d="M 0 160 Q 240 240 450 140 T 900 220"
                fill="none"
                stroke="#0e3a5f"
                strokeWidth="2"
                opacity="0.5"
              />

              {/* Stylized City Blocks (Dark Polygons) */}
              <g opacity="0.6">
                <rect x="50" y="380" width="160" height="70" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />
                <rect x="50" y="270" width="180" height="80" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />
                <rect x="50" y="60" width="140" height="70" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />

                {/* Green Park Sector */}
                <rect x="320" y="380" width="190" height="150" rx="12" fill="#042217" stroke="#064e3b" strokeWidth="1" />
                <text x="415" y="460" fill="#10b981" fontSize="11" fontWeight="600" textAnchor="middle" opacity="0.6">
                  Viman Central Park
                </text>

                <rect x="320" y="220" width="130" height="70" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />
                <rect x="520" y="240" width="140" height="90" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />

                {/* Tech Commercial District */}
                <rect x="520" y="60" width="200" height="90" rx="8" fill="#111c2e" stroke="#1e3a5f" strokeWidth="1" />
                <text x="620" y="110" fill="#38bdf8" fontSize="11" fontWeight="600" textAnchor="middle" opacity="0.6">
                  Cyber City Sector
                </text>

                <rect x="750" y="240" width="110" height="180" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1" />
              </g>

              {/* City Road Network Arteries */}
              <g stroke="#1e293b" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
                {/* Horizontal Major Roads */}
                <line x1="20" y1="480" x2="880" y2="480" />
                <line x1="20" y1="320" x2="880" y2="320" />
                <line x1="20" y1="180" x2="880" y2="180" />
                {/* Vertical Major Roads */}
                <line x1="280" y1="40" x2="280" y2="560" />
                <line x1="480" y1="40" x2="480" y2="560" />
                <line x1="700" y1="40" x2="700" y2="560" />
                {/* Diagonal Connector */}
                <line x1="700" y1="180" x2="800" y2="90" />
              </g>

              {/* Inner Road Lanes */}
              <g stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
                <line x1="20" y1="480" x2="880" y2="480" />
                <line x1="20" y1="320" x2="880" y2="320" />
                <line x1="20" y1="180" x2="880" y2="180" />
                <line x1="280" y1="40" x2="280" y2="560" />
                <line x1="480" y1="40" x2="480" y2="560" />
                <line x1="700" y1="40" x2="700" y2="560" />
                <line x1="700" y1="180" x2="800" y2="90" />
              </g>

              {/* ============================================================= */}
              {/* Shortest Route Rendering                                      */}
              {/* ============================================================= */}

              {/* 1. Underlying Route Glow Effect */}
              <path
                d={ROUTE_PATH_D}
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeOpacity="0.2"
                filter="url(#neon-glow)"
              />

              {/* 2. Base Dark Route Layer */}
              <path
                d={ROUTE_PATH_D}
                fill="none"
                stroke="#047857"
                strokeWidth="5"
                strokeOpacity="0.5"
              />

              {/* 3. Animated Forward-Flowing Dashed Neon Path */}
              <path
                d={ROUTE_PATH_D}
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeDasharray="10 8"
                strokeLinecap="round"
                className="animate-[dash_1.5s_linear_infinite]"
                style={{
                  strokeDashoffset: -progress * 200,
                }}
              />

              {/* 4. Active Traveled Solid Stroke behind Rider */}
              <path
                ref={pathRef}
                d={ROUTE_PATH_D}
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${traveledStrokeLength} ${pathTotalLength}`}
                filter="url(#neon-glow)"
              />

              {/* ============================================================= */}
              {/* Location Markers: Point A (Dark Store) & Point B (Customer)  */}
              {/* ============================================================= */}

              {/* Point A: Dark Store (120, 480) */}
              <g transform={`translate(${POINT_A.x}, ${POINT_A.y})`}>
                {/* Pulsing Beacon Rings */}
                <circle r="36" fill="url(#hub-pulse-grad)" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                <circle r="8" fill="#10b981" />

                {/* Dark Store Icon & Label */}
                <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#ffffff">
                  ⚡
                </text>
                <g transform="translate(0, -32)">
                  <rect x="-65" y="-12" width="130" height="22" rx="11" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" opacity="0.95" />
                  <text x="0" y="3" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="800">
                    HUB #03 (ORIGIN)
                  </text>
                </g>
              </g>

              {/* Point B: Customer Destination (780, 110) */}
              <g transform={`translate(${POINT_B.x}, ${POINT_B.y})`}>
                {/* Glowing Radar Pulse */}
                <circle r="34" fill="url(#dest-pulse-grad)" className="animate-pulse" style={{ animationDuration: '2s' }} />
                <circle r="22" fill="#082f49" stroke="#38bdf8" strokeWidth="2.5" />
                <circle r="7" fill="#38bdf8" />

                {/* Home / Destination Pin Icon */}
                <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#ffffff">
                  🏠
                </text>
                <g transform="translate(0, -32)">
                  <rect x="-70" y="-12" width="140" height="22" rx="11" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
                  <text x="0" y="3" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="800">
                    CUSTOMER (DESTINATION)
                  </text>
                </g>
              </g>

              {/* ============================================================= */}
              {/* Delivery Rider Animation: Traversing the exact SVG Path       */}
              {/* ============================================================= */}
              <g transform={`translate(${riderCoords.x}, ${riderCoords.y})`}>
                {/* Dynamic Radial Glow under rider */}
                <circle r="24" fill="#10b981" opacity="0.25" className="animate-ping" style={{ animationDuration: '1.2s' }} />
                
                {/* Rotating Rider Vehicle Container */}
                <g transform={`rotate(${riderCoords.angle})`}>
                  {/* Outer Shield */}
                  <circle r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" filter="url(#neon-glow)" />
                  {/* Forward Vehicle Direction Arrow Indicator */}
                  <path d="M 12 0 L 7 -4 L 7 4 Z" fill="#34d399" />
                  {/* Motorcycle Icon */}
                  <text x="-1" y="5" textAnchor="middle" fontSize="14">
                    🛵
                  </text>
                </g>

                {/* Floating Rider Mini Tooltip */}
                <g transform="translate(0, 32)">
                  <rect
                    x="-55"
                    y="-11"
                    width="110"
                    height="20"
                    rx="10"
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    opacity="0.95"
                  />
                  <text x="0" y="3" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="800">
                    {info.riderName.split(' ')[0]} • MH 20
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* ================================================================= */}
          {/* Live Telemetry Overlay Card (Glassmorphism UI)                    */}
          {/* ================================================================= */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:w-96 z-30 pointer-events-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-3xl border border-slate-700/60 bg-slate-900/85 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl"
            >
              {/* Rider Header Profile */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/80 text-xl shadow-inner">
                      🛵
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-sm text-white">{info.riderName}</h3>
                      <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        ★ {info.riderRating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{info.riderVehicle}</p>
                  </div>
                </div>

                {/* Call Button */}
                <a
                  href={`tel:${info.riderPhone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition"
                  title="Call Rider"
                >
                  📞
                </a>
              </div>

              {/* Dynamic Live ETA Countdown & Distance */}
              <div className="my-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Estimated Delivery
                  </span>
                  <div className="text-lg font-black tracking-tight text-emerald-400">
                    {etaText}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Distance Remaining
                  </span>
                  <div className="text-sm font-extrabold text-cyan-300 font-mono">
                    {remainingDistanceKm} km
                  </div>
                </div>
              </div>

              {/* 4 Fulfillment Milestones Indicator */}
              <div className="mb-3 grid grid-cols-4 gap-1.5 text-center">
                {[
                  { key: 'placed', label: 'Placed', icon: '✓', active: true },
                  { key: 'packed', label: 'Packed', icon: '📦', active: progress >= 0.1 },
                  { key: 'dispatched', label: 'Dispatched', icon: '🛵', active: progress >= 0.3 },
                  { key: 'arriving', label: 'Arriving', icon: '🏠', active: progress >= 0.85 },
                ].map((m) => (
                  <div
                    key={m.key}
                    className={`rounded-lg py-1 px-1 border transition-all ${
                      m.active
                        ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/30 text-slate-500'
                    }`}
                  >
                    <div className="text-[11px] leading-none mb-0.5">{m.icon}</div>
                    <div className="text-[9px] font-bold uppercase tracking-tight">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Synchronized Linear Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Hub Picked</span>
                  <span className="font-mono text-emerald-400">{(progress * 100).toFixed(0)}%</span>
                  <span>Delivered</span>
                </div>

                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-md shadow-emerald-500/50"
                    style={{ width: `${Math.max(4, progress * 100)}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Delivery Address Snippet */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start space-x-2 text-xs text-slate-400">
                <span className="text-emerald-400 text-sm">📍</span>
                <span className="truncate">{info.customerAddress}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveDeliveryTrackingMap;
