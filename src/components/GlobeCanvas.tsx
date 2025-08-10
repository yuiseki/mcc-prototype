import React, { useRef, useEffect, useMemo } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers';
import { useStore } from '../store/useStore';
import type { Hub, Link } from '../types';

const MAPBOX_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const STATUS_COLORS = {
  ok: [58, 230, 141],
  warn: [247, 181, 0],  
  alarm: [255, 77, 79]
};

interface GlobeCanvasProps {
  className?: string;
}

export function GlobeCanvas({ className = '' }: GlobeCanvasProps) {
  const mapRef = useRef<any>();
  const overlayRef = useRef<MapboxOverlay>();
  
  const { hubs, links, ui } = useStore();
  const setFocusHub = useStore((state) => state.setFocusHub);

  const initialViewState = {
    longitude: 105,
    latitude: 20,
    zoom: 1.4,
    pitch: 0,
    bearing: 0
  };

  // Create layers
  const layers = useMemo(() => {
    const layerList = [];

    // Arc Layer
    if (ui.layers.arcs && links.length > 0) {
      layerList.push(
        new ArcLayer({
          id: 'arc-layer',
          data: links,
          pickable: true,
          getWidth: (d: Link) => Math.max(2, Math.min(8, d.volume / 100)),
          getSourcePosition: (d: Link) => {
            const fromHub = hubs.find(h => h.id === d.fromHubId);
            return fromHub ? [fromHub.lon, fromHub.lat] : [0, 0];
          },
          getTargetPosition: (d: Link) => {
            const toHub = hubs.find(h => h.id === d.toHubId);
            return toHub ? [toHub.lon, toHub.lat] : [0, 0];
          },
          getSourceColor: (d: Link) => [...STATUS_COLORS[d.status], 120],
          getTargetColor: (d: Link) => [...STATUS_COLORS[d.status], 120],
          greatCircle: true,
          getHeight: 0.1,
          getTilt: 0
        })
      );
    }

    // Hub Scatter Layer
    if (ui.layers.hubs && hubs.length > 0) {
      layerList.push(
        new ScatterplotLayer({
          id: 'hub-layer',
          data: hubs,
          pickable: true,
          getPosition: (d: Hub) => [d.lon, d.lat],
          getRadius: (d: Hub) => Math.max(50000, d.load * 200000),
          getFillColor: (d: Hub) => [
            ...STATUS_COLORS[d.status], 
            ui.focusHubId === d.id ? 255 : 180
          ],
          getLineColor: (d: Hub) => [255, 255, 255, 100],
          getLineWidth: ui.focusHubId ? (d: Hub) => d.id === ui.focusHubId ? 3 : 1 : 1,
          radiusScale: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 20,
          lineWidthMinPixels: 1,
          onClick: (info) => {
            if (info.object) {
              setFocusHub(info.object.id);
            }
          }
        })
      );
    }

    // Text Label Layer
    if (ui.layers.labels && hubs.length > 0) {
      layerList.push(
        new TextLayer({
          id: 'text-layer',
          data: hubs.filter(hub => hub.load > 0.5), // Only show labels for high-load hubs
          pickable: false,
          getPosition: (d: Hub) => [d.lon, d.lat],
          getText: (d: Hub) => d.name,
          getSize: 12,
          getColor: [230, 237, 243, 200],
          getAngle: 0,
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
          fontFamily: 'Inter, Arial, sans-serif',
          fontWeight: 500,
          sizeUnits: 'pixels'
        })
      );
    }

    return layerList;
  }, [hubs, links, ui.layers, ui.focusHubId, setFocusHub]);

  // Initialize overlay
  useEffect(() => {
    if (mapRef.current && !overlayRef.current) {
      overlayRef.current = new MapboxOverlay({
        interleaved: true,
        layers: []
      });
      mapRef.current.addControl(overlayRef.current);
    }
  }, []);

  // Update layers
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setProps({ layers });
    }
  }, [layers]);

  return (
    <div className={`globe-canvas relative h-full ${className}`}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={MAPBOX_STYLE}
        projection="globe"
        antialias={true}
        onLoad={() => {
          // Auto-rotate the globe
          if (mapRef.current && !ui.paused) {
            const rotateCamera = () => {
              if (mapRef.current && !ui.paused) {
                mapRef.current.easeTo({
                  bearing: mapRef.current.getBearing() + 0.2,
                  duration: 1000,
                  easing: (t: number) => t
                });
              }
            };
            setInterval(rotateCamera, 1000);
          }
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {ui.paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl font-bold text-[var(--fg-tertiary)] opacity-20">
              PAUSED
            </div>
          </div>
        )}
      </Map>
      
      {/* Loading indicator */}
      <div className="absolute top-4 left-4 text-[var(--fg-tertiary)] text-sm">
        Hubs: {hubs.length} | Links: {links.length}
      </div>
    </div>
  );
}