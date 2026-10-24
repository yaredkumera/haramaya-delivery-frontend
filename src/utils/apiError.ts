import type { ApiErrorBody } from "../types"

function getBody(error: unknown): Partial<ApiErrorBody> | undefined {
  if (typeof error === "object" && error !== null && "data" in error) {
    return (error as { data?: Partial<ApiErrorBody> }).data
  }
  return undefined
}

export function getErrorMessage(error: unknown): string {
  return getBody(error)?.message ?? "Cannot reach the server. Check your connection and try again."
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {}
  for (const e of getBody(error)?.errors ?? []) result[e.field] ??= e.message
  return result
}