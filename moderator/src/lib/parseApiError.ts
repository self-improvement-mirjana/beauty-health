import type { ApiErrorBody } from '@/features/catalog/types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** RTK Query / fetchBaseQuery error shape → user-visible strings. */
export function parseApiError(error: unknown): { message: string; details: string[] } {
  if (!isRecord(error)) {
    return { message: 'Nepoznata greška', details: [] };
  }
  const statusRaw = error.status;
  const statusNum = typeof statusRaw === 'number' ? statusRaw : undefined;
  const data = error.data;
  if (isRecord(data) && typeof data.message === 'string') {
    const body = data as unknown as ApiErrorBody;
    const details = Array.isArray(body.details) ? body.details.filter((d) => typeof d === 'string') : [];
    return { message: body.message, details };
  }
  if (statusRaw === 'FETCH_ERROR' || statusRaw === 'PARSING_ERROR') {
    return { message: 'Mrežna greška ili server nije dostupan', details: [] };
  }
  if (typeof statusNum === 'number') {
    return { message: `HTTP ${statusNum}`, details: [] };
  }
  return { message: 'Greška pri komunikaciji sa serverom', details: [] };
}
