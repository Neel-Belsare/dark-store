import { useState, useEffect, useRef } from 'react';
import { LiveRiderTelemetry, FulfillmentMilestone } from '../types';
import { getApiBaseUrl } from '../config/apiConfig';

const INITIAL_TELEMETRY: LiveRiderTelemetry = {
  order_id: '',
  milestone: 'Order Placed',
  milestone_index: 1,
  progress_pct: 0,
  rider_lat: 19.8735,
  rider_lon: 75.3621,
  speed_kmh: 0,
  distance_remaining_km: 1.8,
  eta_mins: 5,
  timestamp: '',
};

export function useLiveTracking(orderId: string | null | undefined, initialDistanceKm = 1.8, initialEtaMins = 5) {
  const [telemetry, setTelemetry] = useState<LiveRiderTelemetry>({
    ...INITIAL_TELEMETRY,
    order_id: orderId || '',
    distance_remaining_km: initialDistanceKm,
    eta_mins: initialEtaMins,
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
      return;
    }

    // Convert http/https base url to ws/wss
    const baseUrl = getApiBaseUrl();
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/tracking/${orderId}`;

    let socket: WebSocket | null = null;
    let didConnect = false;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        didConnect = true;
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data: LiveRiderTelemetry = JSON.parse(event.data);
          setTelemetry(data);
        } catch {
          // Parse error
        }
      };

      socket.onerror = () => {
        // Will fallback to simulation
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (!didConnect) {
          startSimulationFallback();
        }
      };
    } catch {
      startSimulationFallback();
    }

    // Timeout: if no WS connected in 2s, start simulation fallback
    const fallbackTimeout = setTimeout(() => {
      if (!didConnect) {
        startSimulationFallback();
      }
    }, 2000);

    function startSimulationFallback() {
      if (simulationTimerRef.current) return;
      let tick = 0;
      simulationTimerRef.current = setInterval(() => {
        tick += 1;
        let milestone: FulfillmentMilestone = 'Order Placed';
        let milestoneIdx = 1;
        let pct = 5;
        let speed = 0;

        if (tick <= 2) {
          milestone = 'Order Placed';
          milestoneIdx = 1;
          pct = 10;
        } else if (tick <= 5) {
          milestone = 'Packed at Hub';
          milestoneIdx = 2;
          pct = 25;
        } else if (tick <= 12) {
          milestone = 'Dispatched';
          milestoneIdx = 3;
          pct = Math.min(92, Math.round(25 + ((tick - 5) / 7) * 67));
          speed = 28;
        } else {
          milestone = 'Arriving';
          milestoneIdx = 4;
          pct = 100;
          speed = 8;
        }

        const remainingKm = Math.max(0, Number(((1 - pct / 100) * initialDistanceKm).toFixed(2)));
        const remEta = Math.max(1, Math.ceil(remainingKm * 2.6));

        setTelemetry({
          order_id: orderId || '',
          milestone,
          milestone_index: milestoneIdx,
          progress_pct: pct,
          rider_lat: 19.8735,
          rider_lon: 75.3621,
          speed_kmh: speed,
          distance_remaining_km: remainingKm,
          eta_mins: remEta,
          timestamp: new Date().toLocaleTimeString(),
        });
      }, 1000);
    }

    return () => {
      clearTimeout(fallbackTimeout);
      if (socket) socket.close();
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [orderId, initialDistanceKm, initialEtaMins]);

  return {
    telemetry,
    isConnected,
    milestone: telemetry.milestone,
    milestoneIndex: telemetry.milestone_index,
    progressPct: telemetry.progress_pct,
    etaMins: telemetry.eta_mins,
    distanceKm: telemetry.distance_remaining_km,
  };
}
