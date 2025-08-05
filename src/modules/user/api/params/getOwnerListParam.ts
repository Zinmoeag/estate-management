import { z } from 'zod';

export const getOwnerListParamSchema = z.object({
  limit: z.number().min(1).optional(),
  page: z.number().min(1).optional(),
  search: z.string().optional().optional(),
  searchBy: z.enum(['username', 'address']).optional(),
});

export type GetOwnerListParamType = z.infer<typeof getOwnerListParamSchema>;
