import { create } from 'zustand';
import type { PhotoAnalysisResult, FlightOcrResult } from '@/lib/schemas';

interface FullAnalysisResult {
  pet: {
    animal_type: string;
    breed_ko: string;
    breed_en: string;
    estimated_weight_kg: number;
    is_brachycephalic: boolean;
    size_category: string;
  };
  flight: {
    airline_code: string;
    airline_name_ko: string;
    flight_number: string;
    departure_date: string;
    departure_airport: string;
    arrival_airport: string;
    destination_country_code: string;
    destination_country_ko: string;
  };
  destination: {
    code: string;
    nameKo: string;
    nameEn: string;
    officialSource: string;
  };
  transport: {
    mode: 'CABIN' | 'CARGO' | 'CABIN_ONLY' | 'NOT_AVAILABLE';
    reason: string;
    airline_policy: Record<string, unknown>;
  };
  timeline: Array<{
    dDay: string;
    date: string;
    title: string;
    description: string;
    isRequired: boolean;
    estimatedCost: string;
    issueMethod: string;
  }>;
  totalEstimatedCost: string;
  warnings: string[];
}

interface AnalysisState {
  petPhoto: File | null;
  petAnalysis: PhotoAnalysisResult | null;
  flightPhoto: File | null;
  flightInfo: FlightOcrResult | null;
  fullAnalysis: FullAnalysisResult | null;

  setPetPhoto: (photo: File | null) => void;
  setPetAnalysis: (result: PhotoAnalysisResult | null) => void;
  setFlightPhoto: (photo: File | null) => void;
  setFlightInfo: (info: FlightOcrResult | null) => void;
  setFullAnalysis: (result: FullAnalysisResult | null) => void;
  reset: () => void;
}

const initialState = {
  petPhoto: null,
  petAnalysis: null,
  flightPhoto: null,
  flightInfo: null,
  fullAnalysis: null,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,

  setPetPhoto: (photo) => set({ petPhoto: photo }),
  setPetAnalysis: (result) => set({ petAnalysis: result }),
  setFlightPhoto: (photo) => set({ flightPhoto: photo }),
  setFlightInfo: (info) => set({ flightInfo: info }),
  setFullAnalysis: (result) => set({ fullAnalysis: result }),
  reset: () => set(initialState),
}));
