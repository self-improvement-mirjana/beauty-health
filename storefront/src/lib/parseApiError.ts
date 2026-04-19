type ApiErrorBody = {
  code: string;
  message: string;
  details: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function tryApiBodyFromData(data: unknown): ApiErrorBody | null {
  let payload: Record<string, unknown> | null = null;
  if (isRecord(data)) {
    payload = data;
  } else if (typeof data === 'string') {
    try {
      const p: unknown = JSON.parse(data);
      if (isRecord(p)) {
        payload = p;
      }
    } catch {
      return null;
    }
  }
  if (payload && typeof payload.message === 'string') {
    return payload as unknown as ApiErrorBody;
  }
  return null;
}

export function parseApiError(error: unknown): { message: string; details: string[] } {
  if (!isRecord(error)) {
    return { message: 'Nepoznata greška', details: [] };
  }
  const statusRaw = error.status;
  const statusNum = typeof statusRaw === 'number' ? statusRaw : undefined;
  const body = tryApiBodyFromData(error.data);
  if (body) {
    const details = Array.isArray(body.details) ? body.details.filter((d) => typeof d === 'string') : [];
    let message = body.message;
    if (
      body.code === 'INTERNAL_ERROR' &&
      message === 'An unexpected error occurred'
    ) {
      message =
        'Greška na serveru. Ako ste menjali kod, ponovo izgradite backend (npr. docker compose build backend && docker compose up -d backend).';
    }
    return { message, details };
  }
  if (statusRaw === 'FETCH_ERROR' || statusRaw === 'PARSING_ERROR') {
    return { message: 'Mrežna greška ili server nije dostupan', details: [] };
  }
  if (typeof statusNum === 'number') {
    return { message: `HTTP ${statusNum}`, details: [] };
  }
  return { message: 'Greška pri komunikaciji sa serverom', details: [] };
}
