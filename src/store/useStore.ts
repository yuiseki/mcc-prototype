import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DataGenerator } from '../mock/generator';
import type { RootState } from '../types';

const generator = new DataGenerator(42); // Fixed seed for reproducibility

interface StoreActions {
  initialize: () => void;
  tick: () => void;
  togglePause: () => void;
  setSpeed: (speed: 1 | 2) => void;
  toggleLayer: (layer: keyof RootState['ui']['layers']) => void;
  setFocusHub: (hubId?: string) => void;
  startUpdateLoop: () => void;
  stopUpdateLoop: () => void;
  loadCableData: () => Promise<void>;
  setHighlightedCable: (cableId?: string) => void;
  startCableHighlightLoop: () => void;
  stopCableHighlightLoop: () => void;
}

const initialState: RootState = {
  hubs: [],
  links: [],
  kpis: [],
  events: [],
  ui: {
    paused: false,
    speed: 1,
    layers: {
      arcs: true,
      hubs: true,
      labels: true
    },
    focusHubId: undefined
  },
  seed: 42,
  refreshMs: 3000,
  lastUpdate: 0,
  cables: null,
  highlightedCableId: undefined
};

let updateInterval: NodeJS.Timeout | null = null;
let cableHighlightInterval: NodeJS.Timeout | null = null;

export const useStore = create<RootState & StoreActions>()(
  immer((set, get) => ({
    ...initialState,

    initialize: () => {
      set((state) => {
        const hubs = generator.initHubs();
        const links = generator.initLinks(hubs);
        const kpis = generator.initKPIs();
        const events = generator.generateEvents(hubs, 10);

        state.hubs = hubs;
        state.links = links;
        state.kpis = kpis;
        state.events = events;
        state.lastUpdate = Date.now();
      });
    },

    tick: () => {
      const state = get();
      if (state.ui.paused) return;

      set((draft) => {
        const { hubs, links, kpis, events } = generator.updateData(
          draft.hubs,
          draft.links,
          draft.kpis,
          draft.events
        );

        draft.hubs = hubs;
        draft.links = links;
        draft.kpis = kpis;
        draft.events = events;
        draft.lastUpdate = Date.now();
      });
    },

    togglePause: () => {
      set((state) => {
        state.ui.paused = !state.ui.paused;
      });
    },

    setSpeed: (speed) => {
      set((state) => {
        state.ui.speed = speed;
        state.refreshMs = 3000 / speed;
      });
      
      // Restart update loop with new speed
      const { stopUpdateLoop, startUpdateLoop } = get();
      stopUpdateLoop();
      startUpdateLoop();
    },

    toggleLayer: (layer) => {
      set((state) => {
        state.ui.layers[layer] = !state.ui.layers[layer];
      });
    },

    setFocusHub: (hubId) => {
      set((state) => {
        state.ui.focusHubId = hubId;
      });
    },

    startUpdateLoop: () => {
      const { refreshMs } = get();
      updateInterval = setInterval(() => {
        get().tick();
      }, refreshMs);
    },

    stopUpdateLoop: () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    },

    loadCableData: async () => {
      try {
        const response = await fetch('https://z.yuiseki.net/static/cable-geo.json');
        const cableData = await response.json();
        
        set((state) => {
          // Add random colors to each cable feature
          if (cableData.features) {
            cableData.features.forEach((feature: { properties?: Record<string, unknown>; id?: string | number }) => {
              if (!feature.properties) {
                feature.properties = {};
              }
              // Generate random color for each cable
              feature.properties.color = [
                Math.floor(Math.random() * 128) + 127, // R: 127-255
                Math.floor(Math.random() * 128) + 127, // G: 127-255
                Math.floor(Math.random() * 128) + 127  // B: 127-255
              ];
            });
          }
          
          state.cables = cableData;
        });
      } catch (error) {
        console.error('Failed to load cable data:', error);
      }
    },

    setHighlightedCable: (cableId) => {
      set((state) => {
        state.highlightedCableId = cableId;
      });
    },

    startCableHighlightLoop: () => {
      const highlightRandomCable = () => {
        const state = get();
        if (state.cables?.features && state.cables.features.length > 0) {
          const randomIndex = Math.floor(Math.random() * state.cables.features.length);
          const randomCable = state.cables.features[randomIndex];
          const cableId = typeof randomCable.id === 'string' ? randomCable.id : `cable-${randomIndex}`;
          state.setHighlightedCable(cableId);
          
          // Clear highlight after a short duration
          setTimeout(() => {
            state.setHighlightedCable(undefined);
          }, 1000);
        }
      };

      // Start highlighting every 3 seconds
      cableHighlightInterval = setInterval(highlightRandomCable, 3000);
    },

    stopCableHighlightLoop: () => {
      if (cableHighlightInterval) {
        clearInterval(cableHighlightInterval);
        cableHighlightInterval = null;
      }
    }
  }))
);