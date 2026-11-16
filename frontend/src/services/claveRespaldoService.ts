//frontend/src/services/claveRespaldoService.ts
import { apiFetch } from './apiService'
import type { ClaveRespaldo, CuentaClaves } from '../types/claveRespaldo'

export const listarCuentasConClaves = () =>
  apiFetch<CuentaClaves[]>('/claves-respaldo/cuentas')

export const listarClavesDeCuenta = (usuarioId: string) =>
  apiFetch<ClaveRespaldo[]>(`/claves-respaldo?usuarioId=${usuarioId}`)