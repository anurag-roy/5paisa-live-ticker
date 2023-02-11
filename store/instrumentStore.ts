import { UiInstrument } from '@/components/SubscriptionForm';
import { create } from 'zustand';

interface InstrumentState {
  instruments: UiInstrument[];
  setStore: (instruments: UiInstrument[]) => void;
  updateInstrument: (token: number, bid: number, ask: number) => void;
}

export const useInstrumentStore = create<InstrumentState>((set) => ({
  instruments: [],
  setStore: (instruments) => set((state) => ({ instruments })),
  updateInstrument: (token, bid, ask) => {
    return set((state) => {
      return {
        instruments: state.instruments.map((i) => {
          if (i.scripcode === token) {
            return {
              ...i,
              bid,
              ask,
            };
          } else return i;
        }),
      };
    });
  },
}));
