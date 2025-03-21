/**
 * Custom JSON serializer that handles BigInt values
 * This solves the "Do not know how to serialize a BigInt" error
 */

/**
 * Custom JSON replacer function that converts BigInt to string
 * This should be used when calling JSON.stringify() with data that may contain BigInt values
 */
export function bigIntSerializer(key: string, value: any): any {
  // Check if the value is a BigInt and convert it to a string
  if (typeof value === "bigint") {
    return value.toString()
  }

  // Return all other values unchanged
  return value
}

/**
 * Wrapper around JSON.stringify that safely handles BigInt values
 */
export function safeStringify(obj: any): string {
  return JSON.stringify(obj, bigIntSerializer)
}

/**
 * SafeJSON object to use as a replacement for JSON
 * Provides the same interface as the native JSON object but with BigInt handling
 */
export const SafeJSON = {
  stringify: (
    value: any,
    replacer?: (key: string, value: any) => any,
    space?: string | number
  ): string => {
    const effectiveReplacer = replacer
      ? (key: string, val: any) => {
          // Apply our BigInt serializer first, then the custom replacer
          const processedValue = typeof val === "bigint" ? val.toString() : val
          return replacer(key, processedValue)
        }
      : bigIntSerializer

    return JSON.stringify(value, effectiveReplacer, space)
  },

  // Parse remains the same as the native JSON.parse
  parse: JSON.parse,
}
