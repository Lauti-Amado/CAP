const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error { 
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${ruta}`, {
        ...opciones,
        credentials: 'include', //Esto envía httpOnly cookie
        headers: {
            'Content-Type': 'application/json',
            ...opciones.headers,
        },
    });

    let cuerpo = null;

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        cuerpo = await res.json();
    } else if (!res.ok) {
        throw new ApiError(res.status, res.statusText || `Fallo del servidor (${res.status})`);
    }

    if (res.status === 401) {
        window.dispatchEvent(new Event('sesion-expirada'));
    }

    if (!res.ok) throw new ApiError(res.status, cuerpo?.error ?? `Error ${res.status}`);

    return cuerpo as T;
}