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
  lastUpdate: 0
};

let updateInterval: NodeJS.Timeout | null = null;

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
    }
  }))
);