import { z } from 'zod';

const Base = z.object({
  suppliers: z.coerce.number().int().min(0, 'Suppliers must be ≥ 0'),
  water_m3: z.coerce.number().min(0, 'Water must be ≥ 0'),
  waste_t: z.coerce.number().min(0, 'Waste must be ≥ 0'),
  target_year: z.coerce.number().int().min(2000).max(2100),
  notes: z.string().max(5000).optional(),
});

export const B1FinalSchema = Base.strip();
export const B1DraftSchema = Base.partial().strip();

export type B1Final = z.infer<typeof B1FinalSchema>;
export type B1Draft = z.infer<typeof B1DraftSchema>;
