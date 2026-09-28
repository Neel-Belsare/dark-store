import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

interface RealDeliveryMapProps {
  storeLat: number;
  storeLon: number;
  storeName: string;
  custLat: number;
  custLon: number;
  custAddress?: string;
  riderName: string;
  distanceKm: number;
  etaMins: number;
  onReplay?: () => void;
}

export const RealDeliveryMap: React.FC<RealDeliveryMapProps> = ({
  storeLat,
  storeLon,
  storeName,
  custLat,
  custLon,
  custAddress = 'Delivery Address',
  riderName,
  distanceKm,
  etaMins,
}) => {
  const [mapStyle, setMapStyle] = useState<'voyager' | 'dark' | 'osm'>('voyager');
  const [replayKey, setReplayKey] = useState<number>(0);

  // Generate Leaflet HTML document to embed inside the web iframe
  const leafletHtml = useMemo(() => {
    const cleanStoreName = (storeName || 'Dark Store Hub').replace(/'/g, "\\'");
    const cleanCustAddress = (custAddress || 'Your Location').replace(/'/g, "\\'");
    const cleanRiderName = (riderName || 'Rahul S. (Rider #18)').replace(/'/g, "\\'");

    // Determine tile URL based on mapStyle
    const tileLayerUrls = {
      voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    };
    const activeTileUrl = tileLayerUrls[mapStyle] || tileLayerUrls.voyager;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* Custom Markers */
    .store-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .store-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0C831F;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(12, 131, 31, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      z-index: 2;
    }
    .store-pulse {
      position: absolute;
      top: -4px;
      left: -4px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(12, 131, 31, 0.25);
      animation: pulse-ring 2s infinite ease-out;
      z-index: 1;
    }
    .store-label {
      background: rgba(15, 23, 42, 0.88);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
      margin-top: 3px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.2);
    }

    .cust-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .cust-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #EF4444;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      z-index: 2;
    }
    .cust-pulse {
      position: absolute;
      top: -4px;
      left: -4px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.25);
      animation: pulse-ring 2s infinite ease-out;
      z-index: 1;
    }
    .cust-label {
      background: #1E293B;
      color: #38BDF8;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
      margin-top: 3px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 1px solid rgba(56, 189, 248, 0.4);
    }

    /* Animated Delivery Rider */
    .rider-marker {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.15s ease-out;
    }
    .rider-halo {
      position: absolute;
      top: -6px;
      left: -6px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(14, 165, 233, 0.35);
      animation: pulse-ring 1.4s infinite ease-out;
    }
    .rider-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F7D435;
      border: 2.5px solid #0F172A;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      z-index: 3;
    }
    .rider-tag {
      background: #0F172A;
      color: #F7D435;
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 3px;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      border: 1px solid rgba(247, 212, 53, 0.3);
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Live Watermark / Controls */
    .map-badge-overlay {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 5px 10px;
      border-radius: 20px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22C55E;
      animation: blink 1.2s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    .recenter-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 1000;
      background: #FFFFFF;
      color: #0F172A;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #CBD5E1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .recenter-btn:active {
      transform: scale(0.96);
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="map-badge-overlay">
    <div class="live-dot"></div>
    <span>GPS Live Tracking</span>
  </div>

  <button class="recenter-btn" onclick="fitRouteBounds()">
    <span>🎯 Recenter</span>
  </button>

  <script>
    const storeCoord = [${storeLat}, ${storeLon}];
    const custCoord = [${custLat}, ${custLon}];

    // Initialize Leaflet Map
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    });

    // Add Tile Layer (Carto Voyager / OpenStreetMap)
    L.tileLayer('${activeTileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Custom Store Marker Icon
    const storeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: \`
        <div class="store-marker">
          <div class="store-pulse"></div>
          <div class="store-icon-box">🏬</div>
          <div class="store-label">${cleanStoreName.split(' - ')[0]}</div>
        </div>
      \`,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    // Custom Customer Marker Icon
    const custIcon = L.divIcon({
      className: 'custom-div-icon',
      html: \`
        <div class="cust-marker">
          <div class="cust-pulse"></div>
          <div class="cust-icon-box">🏠</div>
          <div class="cust-label">YOU</div>
        </div>
      \`,
      iconSize: [60, 50],
      iconAnchor: [30, 25]
    });

    // Add Markers to Map
    const storeMarker = L.marker(storeCoord, { icon: storeIcon }).addTo(map);
    const custMarker = L.marker(custCoord, { icon: custIcon }).addTo(map);

    // Fit bounds with generous padding so markers and labels are visible
    function fitRouteBounds() {
      const bounds = L.latLngBounds([storeCoord, custCoord]);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
    }
    fitRouteBounds();

    // Generate realistic multi-waypoint road route connecting store and customer
    function generateFallbackRoadRoute(start, end) {
      const sLat = start[0], sLon = start[1];
      const eLat = end[0], eLon = end[1];

      // Intermediate street intersections simulating city grid
      const dLat = eLat - sLat;
      const dLon = eLon - sLon;

      return [
        [sLat, sLon],
        [sLat + dLat * 0.25, sLon + dLon * 0.05],
        [sLat + dLat * 0.35, sLon + dLon * 0.35],
        [sLat + dLat * 0.65, sLon + dLon * 0.40],
        [sLat + dLat * 0.75, sLon + dLon * 0.75],
        [sLat + dLat * 0.90, sLon + dLon * 0.85],
        [eLat, eLon]
      ];
    }

    let routeCoordinates = generateFallbackRoadRoute(storeCoord, custCoord);

    // Animated Rider Marker
    const riderIcon = L.divIcon({
      className: 'custom-rider-icon',
      html: \`
        <div class="rider-marker">
          <div class="rider-halo"></div>
          <div class="rider-circle">🛵</div>
          <div class="rider-tag">${cleanRiderName.split(' ')[0]} • MH 20</div>
        </div>
      \`,
      iconSize: [70, 50],
      iconAnchor: [35, 25]
    });

    const riderMarker = L.marker(storeCoord, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);

    let routeGlowPolyline = null;
    let routeMainPolyline = null;
    let traversedPolyline = null;

    function drawRoute(coords) {
      if (routeGlowPolyline) map.removeLayer(routeGlowPolyline);
      if (routeMainPolyline) map.removeLayer(routeMainPolyline);
      if (traversedPolyline) map.removeLayer(traversedPolyline);

      // 1. Soft glowing outer line
      routeGlowPolyline = L.polyline(coords, {
        color: '#10B981',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 2. High contrast dashed delivery route
      routeMainPolyline = L.polyline(coords, {
        color: '#0C831F',
        weight: 4.5,
        opacity: 0.9,
        dashArray: '7, 5',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 3. Completed road path line
      traversedPolyline = L.polyline([coords[0]], {
        color: '#059669',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      startRiderTraversal(coords);
    }

    // Try fetching actual turn-by-turn road geometry from Open Source Routing Machine (OSRM)
    async function fetchRealRoadRoute() {
      try {
        const url = \`https://router.project-osrm.org/route/v1/driving/\${storeCoord[1]},\${storeCoord[0]};\${custCoord[1]},\${custCoord[0]}?overview=full&geometries=geojson\`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
          // OSRM returns [lon, lat], Leaflet needs [lat, lon]
          const osrmCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          if (osrmCoords.length > 1) {
            routeCoordinates = osrmCoords;
            drawRoute(routeCoordinates);
            return;
          }
        }
      } catch (e) {
        // Fallback silently
      }
      // Use fallback grid route
      drawRoute(routeCoordinates);
    }

    // Smooth rider traversal animation along polyline coordinates
    let animationId = null;

    function startRiderTraversal(coords) {
      if (animationId) cancelAnimationFrame(animationId);

      const totalSegments = coords.length - 1;
      const durationMs = 12000; // 12 seconds traversal
      let startTime = null;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        let progress = (elapsed % durationMs) / durationMs;

        // Calculate current position along polyline
        const segmentProgress = progress * totalSegments;
        const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
        const fraction = segmentProgress - segmentIndex;

        const p1 = coords[segmentIndex];
        const p2 = coords[segmentIndex + 1] || p1;

        const curLat = p1[0] + (p2[0] - p1[0]) * fraction;
        const curLon = p1[1] + (p2[1] - p1[1]) * fraction;

        riderMarker.setLatLng([curLat, curLon]);

        // Update completed path
        const covered = coords.slice(0, segmentIndex + 1);
        covered.push([curLat, curLon]);
        if (traversedPolyline) {
          traversedPolyline.setLatLngs(covered);
        }

        animationId = requestAnimationFrame(animate);
      }

      animationId = requestAnimationFrame(animate);
    }

    // Start loading route
    fetchRealRoadRoute();
  </script>
</body>
</html>
    `;
  }, [storeLat, storeLon, storeName, custLat, custLon, custAddress, riderName, mapStyle, replayKey]);

  // Fallback for non-web native (uses OpenStreetMap static tile preview)
  const fallbackMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${(storeLat + custLat) / 2},${(storeLon + custLon) / 2}&zoom=14&size=400x240&markers=${storeLat},${storeLon},ol-store|${custLat},${custLon},ol-home`;

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Real Map Canvas */}
      <View style={styles.mapFrame}>
        {Platform.OS === 'web' ? (
          // In React Native Web, create iframe cleanly
          React.createElement('iframe', {
            key: `leaflet-map-${mapStyle}-${replayKey}`,
            srcDoc: leafletHtml,
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: BORDER_RADIUS.lg,
            },
            title: 'Real GPS Delivery Map',
          })
        ) : (
          // Native mobile fallback with OpenStreetMap image
          <View style={styles.nativeFallback}>
            <Image source={{ uri: fallbackMapUrl }} style={styles.fallbackImage} resizeMode="cover" />
            <View style={styles.fallbackBadge}>
              <Text style={styles.fallbackBadgeText}>📍 {storeName} ➔ You</Text>
            </View>
          </View>
        )}
      </View>

      {/* Map Control Bar (Layer Switcher & Replay) */}
      <View style={styles.controlsBar}>
        <View style={styles.layerSelector}>
          <TouchableOpacity
            style={[styles.layerChip, mapStyle === 'voyager' && styles.layerChipActive]}
            onPress={() => setMapStyle('voyager')}
            activeOpacity={0.8}
          >
            <Text style={[styles.layerChipText, mapStyle === 'voyager' && styles.layerChipTextActive]}>
              🗺️ Street
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layerChip, mapStyle === 'dark' && styles.layerChipActive]}
            onPress={() => setMapStyle('dark')}
            activeOpacity={0.8}
          >
            <Text style={[styles.layerChipText, mapStyle === 'dark' && styles.layerChipTextActive]}>
              🌙 Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layerChip, mapStyle === 'osm' && styles.layerChipActive]}
            onPress={() => setMapStyle('osm')}
            activeOpacity={0.8}
          >
            <Text style={[styles.layerChipText, mapStyle === 'osm' && styles.layerChipTextActive]}>
              🌐 OSM
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.replayBtn} onPress={handleReplay} activeOpacity={0.8}>
          <Text style={styles.replayBtnText}>🔄 Replay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  mapFrame: {
    width: '100%',
    height: 230,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  nativeFallback: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  fallbackImage: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  fallbackBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  layerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layerChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  layerChipActive: {
    backgroundColor: COLORS.brandGreenLight,
    borderColor: COLORS.brandGreen,
  },
  layerChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  layerChipTextActive: {
    color: COLORS.brandGreen,
    fontWeight: '800',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  replayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
