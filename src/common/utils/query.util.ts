export const skipTake = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const paginationMeta = (total: number, page: number, limit: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/** "2026-11-20" hole oi din er shesh porjonto dhore (inclusive). */
export function dateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  const isDateOnly = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  return {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(isDateOnly(to) ? `${to}T23:59:59.999Z` : to) }),
  };
}