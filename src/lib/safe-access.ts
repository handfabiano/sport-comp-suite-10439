/**
 * Safe Access Utilities
 * Provides safe accessors for nested properties with fallbacks
 */

/**
 * Safely access equipe properties
 */
export function getEquipeName(equipe: any, fallback: string = 'Equipe não definida'): string {
  return equipe?.nome ?? fallback;
}

/**
 * Safely access equipe logo
 */
export function getEquipeLogo(equipe: any): string | null {
  return equipe?.logo_url ?? null;
}

/**
 * Safely access nested property
 */
export function safeGet<T>(obj: any, path: string, fallback?: T): T | undefined {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null) {
      return fallback;
    }
    result = result[key];
  }

  return result ?? fallback;
}

/**
 * Check if value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Get value or default
 */
export function getOrDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}
