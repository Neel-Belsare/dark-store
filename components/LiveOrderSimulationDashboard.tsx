import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveDeliveryTrackingMap } from './LiveDeliveryTrackingMap';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface OrderSimulationData {
  orderId: string;
  itemsCount: number;
  totalAmount: number;
  customerArea: string;
  matchedStore: string;
  distanceKm: number;
  estimatedMinutes: number;
  riderName: string;
}

export type SimulationStep = 
  | 'idle'
  | 'order_received'         // 0s - 2s
  | 'locating_dark_store'    // 2s - 5s
  | 'store_assigned'         // 5s - 7s
  | 'completed';             // 7s - 9s (auto-close at 9s)

export interface LiveOrderSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: Partial<OrderSimulationData>;
  onSimulationComplete?: (order: OrderSimulationData) => void;
}

// Default mock order if none provided
const DEFAULT_ORDER: OrderSimulationData = {
  orderId: 'CSN-MOB-4821',
  itemsCount: 3,
  totalAmount: 349,
  customerArea: 'Viman Nagar, Sector 4',
  matchedStore: 'Viman Nagar Dark Store #03',
  distanceKm: 0.42,
  estimatedMinutes: 6,
  riderName: 'Rahul Sharma (Fleet ID #18)',
};

// ============================================================================
// Live Order Simulation Modal Component
// ============================================================================

export const LiveOrderSimulationModal: React.FC<LiveOrderSimulationModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSimulationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<SimulationStep>('idle');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const data: OrderSimulationData = { ...DEFAULT_ORDER, ...orderData };

  // Timer references for reliable cleanup
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    timerRef.current.forEach((t) => clearTimeout(t));
    timerRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Run the 0s -> 2s -> 5s -> 7s -> 9s sequence
  useEffect(() => {
    if (isOpen) {
      clearAllTimers();
      setElapsedTime(0);
      setCurrentStep('order_received');

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsedTime(Number(((Date.now() - startTime) / 1000).toFixed(1)));
      }, 100);

      // State 1: Order Received (0s - 2s) is active immediately

      // State 2: Locating Nearest Dark Store... (2s - 5s)
      const t1 = setTimeout(() => {
        setCurrentStep('locating_dark_store');
      }, 2000);

      // State 3: Store Assigned - Processing (5s - 7s)
      const t2 = setTimeout(() => {
        setCurrentStep('store_assigned');
      }, 5000);

      // State 4: Completed (7s - 9s)
      const t3 = setTimeout(() => {
        setCurrentStep('completed');
      }, 7000);

      // Auto-close 2 seconds after the final step (at 9s)
      const t4 = setTimeout(() => {
        clearAllTimers();
        if (onSimulationComplete) {
          onSimulationComplete(data);
        }
        onClose();
        setCurrentStep('idle');
      }, 9000);

      timerRef.current = [t1, t2, t3, t4];
    } else {
      clearAllTimers();
      setCurrentStep('idle');
      setElapsedTime(0);
    }

    return () => {
      clearAllTimers();
    };
  }, [isOpen, onClose, clearAllTimers]);

  // Early manual exit handler
  const handleManualClose = () => {
    clearAllTimers();
    setCurrentStep('idle');
    onClose();
  };

  // Step state helpers
  const isStep1Active = currentStep === 'order_received';
  const isStep1Done = currentStep !== 'idle' && currentStep !== 'order_received';

  const isStep2Active = currentStep === 'locating_dark_store';
  const isStep2Done = currentStep === 'store_assigned' || currentStep === 'completed';

  const isStep3Active = currentStep === 'store_assigned';
  const isStep3Done = currentStep === 'completed';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="simulation-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          {/* Glassmorphic Modal Window */}
          <motion.div
            key="simulation-modal"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl text-slate-100"
          >
            {/* Ambient Background Gradient Flares */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Order Dispatch Routing
                  </span>
                </div>
                <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
                  Order #{data.orderId}
                </h2>
              </div>

              {/* Close Button */}
              <button
                onClick={handleManualClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                title="Dismiss overlay"
                aria-label="Close modal"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="relative z-10 space-y-6 py-6">

              {/* ------------------------------------------------------------- */}
              {/* STEP 1: Order Received (0s - 2s)                             */}
              {/* ------------------------------------------------------------- */}
              <div
                className={`flex items-start space-x-4 transition-all duration-500 ${
                  isStep1Active ? 'opacity-100' : isStep1Done ? 'opacity-40' : 'opacity-20'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-all duration-500 ${
                      isStep1Active
                        ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : isStep1Done
                        ? 'border-emerald-800 bg-slate-800 text-emerald-400'
                        : 'border-slate-700 bg-slate-800/80 text-slate-500'
                    }`}
                  >
                    {isStep1Active ? (
                      // Bouncing Package / Pulsing Visual
                      <motion.span
                        animate={{
                          y: [0, -6, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: 'easeInOut',
                        }}
                      >
                        📦
                      </motion.span>
                    ) : isStep1Done ? (
                      <span>✓</span>
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  {/* Vertical connecting line */}
                  <div
                    className={`mt-2 h-12 w-0.5 transition-colors duration-500 ${
                      isStep1Done ? 'bg-gradient-to-b from-emerald-500 to-cyan-500' : 'bg-slate-800'
                    }`}
                  />
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${isStep1Active ? 'text-white' : 'text-slate-300'}`}>
                      Order Received
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isStep1Active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isStep1Done
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isStep1Active ? 'Processing' : isStep1Done ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Payment verified via UPI. Customer cart locked ({data.itemsCount} items • ₹{data.totalAmount}).
                  </p>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 2: Locating Nearest Dark Store... (2s - 5s)             */}
              {/* ------------------------------------------------------------- */}
              <div
                className={`flex items-start space-x-4 transition-all duration-500 ${
                  isStep2Active ? 'opacity-100' : isStep2Done ? 'opacity-40' : 'opacity-20'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-all duration-500 ${
                      isStep2Active
                        ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : isStep2Done
                        ? 'border-emerald-800 bg-slate-800 text-emerald-400'
                        : 'border-slate-700 bg-slate-800/80 text-slate-500'
                    }`}
                  >
                    {/* Animated Radar Sweep / Ping Ping Ring */}
                    {isStep2Active && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-2xl border-2 border-cyan-400 pointer-events-none"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.6, delay: 0.4, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-2xl border border-cyan-300 pointer-events-none"
                        />
                      </>
                    )}

                    {isStep2Active ? (
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                      >
                        📡
                      </motion.span>
                    ) : isStep2Done ? (
                      <span>✓</span>
                    ) : (
                      <span>📍</span>
                    )}
                  </div>

                  {/* Vertical connecting line */}
                  <div
                    className={`mt-2 h-12 w-0.5 transition-colors duration-500 ${
                      isStep2Done ? 'bg-gradient-to-b from-cyan-500 to-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${isStep2Active ? 'text-white' : 'text-slate-300'}`}>
                      Locating Nearest Dark Store...
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isStep2Active
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isStep2Done
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isStep2Active ? 'Pinging Hubs' : isStep2Done ? 'Matched' : 'Queued'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Calculating Haversine geospatial proximity across active city dark store micro-nodes.
                  </p>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 3: Store Assigned - Processing (5s - 7s)                */}
              {/* ------------------------------------------------------------- */}
              <div
                className={`flex items-start space-x-4 transition-all duration-500 ${
                  isStep3Active || isStep3Done ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-all duration-500 ${
                      isStep3Active || isStep3Done
                        ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-xl shadow-emerald-500/30'
                        : 'border-slate-700 bg-slate-800/80 text-slate-500'
                    }`}
                  >
                    {/* Glowing Success Ring */}
                    {(isStep3Active || isStep3Done) && (
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(16, 185, 129, 0.4)',
                            '0 0 24px rgba(16, 185, 129, 0.9)',
                            '0 0 10px rgba(16, 185, 129, 0.4)',
                          ],
                        }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute inset-0 rounded-2xl border border-emerald-400/80"
                      />
                    )}
                    <span>🏬</span>
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${isStep3Active || isStep3Done ? 'text-white' : 'text-slate-300'}`}>
                      Store Assigned - Processing
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isStep3Active || isStep3Done
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isStep3Active ? 'Fulfilling' : isStep3Done ? 'Dispatched' : 'Waiting'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Warehouse staff picking and packing order; dedicated rider assigned.
                  </p>

                  {/* Matched Store & Routing Telemetry Card */}
                  <AnimatePresence>
                    {(isStep3Active || isStep3Done) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="mt-3 overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Selected Hub:</span>
                          <span className="font-semibold text-emerald-400">{data.matchedStore}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Radial Distance:</span>
                          <span className="font-semibold text-cyan-300">{data.distanceKm} km (Geodesic)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Guaranteed SLA:</span>
                          <span className="font-semibold text-emerald-400">~{data.estimatedMinutes} Mins Delivery</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Fleet Rider:</span>
                          <span className="font-semibold text-slate-200">{data.riderName}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Footer Status Bar & Countdown */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentStep === 'completed'
                      ? 'bg-emerald-400'
                      : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                <span className="font-medium">
                  {currentStep === 'order_received' && 'Step 1/3: Ingesting mobile order...'}
                  {currentStep === 'locating_dark_store' && 'Step 2/3: Searching nearest dark store...'}
                  {currentStep === 'store_assigned' && 'Step 3/3: Routing confirmed & dispatching...'}
                  {currentStep === 'completed' && '✅ Dispatch Complete. Closing in 2s...'}
                </span>
              </div>
              <span className="font-mono text-slate-400 tabular-nums">{elapsedTime.toFixed(1)}s / 9.0s</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Dashboard Container Component (Ready to Plug & Play)
// ============================================================================

export const LiveOrderSimulationDashboard: React.FC = () => {
  const [isSimOpen, setIsSimOpen] = useState<boolean>(false);
  const [isDelivering, setIsDelivering] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<OrderSimulationData>(DEFAULT_ORDER);

  /**
   * Mock triggerSimulation function to trigger the overlay on this dashboard.
   * Can be invoked programmatically or via button click with custom payload.
   */
  const triggerSimulation = (customPayload?: Partial<OrderSimulationData>) => {
    const randomOrderId = `CSN-MOB-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveOrder({
      ...DEFAULT_ORDER,
      orderId: randomOrderId,
      itemsCount: Math.floor(2 + Math.random() * 5),
      totalAmount: Math.floor(200 + Math.random() * 600),
      ...customPayload,
    });
    setIsDelivering(false);
    setIsSimOpen(true);
  };

  const handleSimulationComplete = (completedOrder: OrderSimulationData) => {
    setIsSimOpen(false);
    setIsDelivering(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-slate-100 flex flex-col items-center justify-center font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* If delivering, render the Live Delivery Tracking Map View */}
      {isDelivering ? (
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Live Dispatch Stream
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Active Order Tracking #{activeOrder.orderId}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => triggerSimulation()}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                ⚡ New Simulation
              </button>
              <button
                onClick={() => setIsDelivering(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition active:scale-95"
              >
                ← Command Center
              </button>
            </div>
          </div>

          <LiveDeliveryTrackingMap
            isDelivering={isDelivering}
            orderInfo={{
              orderId: activeOrder.orderId,
              darkStoreName: activeOrder.matchedStore,
              riderName: activeOrder.riderName.replace(/\s*\(.*\)/, ''),
              totalDistanceKm: activeOrder.distanceKm > 0 ? activeOrder.distanceKm : 1.8,
              estimatedMinutesInitial: activeOrder.estimatedMinutes || 8,
            }}
            animationDurationSeconds={12}
            onReset={() => setIsDelivering(false)}
          />
        </div>
      ) : (
        /* Dashboard Card Container */
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Quick-Commerce Dark Store Command Center
                </h1>
                <p className="text-xs text-slate-400">Real-time Haversine Dispatch Engine</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-800/80 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-400">
              System Online
            </span>
          </div>

          {/* Live Network Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Stores</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-400">11 Hubs</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average SLA</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-cyan-400">8.2 Mins</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Router Latency</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-indigo-400">4.1 ms</div>
            </div>
          </div>

          {/* Trigger Simulation Action Box */}
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-2xl text-emerald-400 shadow-inner">
              ⚡
            </div>
            <h2 className="text-base font-bold text-white mb-1">Simulate Incoming Mobile Order</h2>
            <p className="mx-auto max-w-md text-xs text-slate-400 mb-5 leading-relaxed">
              Click the button below to simulate an order placed from the React Native Blinkit clone app. 
              This will launch the animated glassmorphism routing overlay across all 3 progression states,
              then transition directly into the <strong>Live Delivery Tracking Map</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => triggerSimulation()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 active:scale-95"
              >
                <span>🚀</span>
                <span>triggerSimulation()</span>
              </button>
              <button
                onClick={() => setIsDelivering(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white transition active:scale-95"
              >
                <span>🗺️</span>
                <span>Open Map Directly (mock)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Simulation Modal Overlay */}
      <LiveOrderSimulationModal
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        onSimulationComplete={handleSimulationComplete}
        orderData={activeOrder}
      />
    </div>
  );
};

export default LiveOrderSimulationDashboard;
