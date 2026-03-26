import { z } from 'zod';

export const PhotoAnalysisSchema = z.object({
  animal_type: z.enum(['dog', 'cat']),
  breed_ko: z.string().min(1),
  breed_en: z.string().min(1),
  estimated_weight_kg: z.number().positive().max(100),
  is_brachycephalic: z.boolean(),
  size_category: z.enum(['small', 'medium', 'large']),
  confidence: z.number().min(0).max(1),
  notes_ko: z.string().optional(),
});

export type PhotoAnalysisResult = z.infer<typeof PhotoAnalysisSchema>;

export const FlightOcrSchema = z.object({
  airline_code: z.string().min(2).max(3),
  airline_name_ko: z.string().min(1),
  flight_number: z.string().min(2),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departure_airport: z.string().length(3),
  arrival_airport: z.string().length(3),
  destination_country_code: z.string().length(2),
  destination_country_ko: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type FlightOcrResult = z.infer<typeof FlightOcrSchema>;

export const FullAnalysisRequestSchema = z.object({
  petInfo: z.object({
    animal_type: z.enum(['dog', 'cat']),
    breed_ko: z.string().min(1),
    breed_en: z.string().min(1),
    estimated_weight_kg: z.number().positive(),
    is_brachycephalic: z.boolean(),
    size_category: z.enum(['small', 'medium', 'large']),
  }),
  flightInfo: z.object({
    airline_code: z.string().min(2).max(3),
    airline_name_ko: z.string().min(1),
    flight_number: z.string().min(2),
    departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    departure_airport: z.string().length(3),
    arrival_airport: z.string().length(3),
    destination_country_code: z.string().length(2),
    destination_country_ko: z.string().min(1),
  }),
});

export type FullAnalysisRequest = z.infer<typeof FullAnalysisRequestSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  petPhoto: z.string().nullable(),
  petAnalysis: PhotoAnalysisSchema.nullable(),
  flightInfo: FlightOcrSchema.nullable(),
  fullAnalysis: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;
