declare module 'bcryptjs' {
  /**
   * Generate a hash for the plaintext password
   * @param data The plaintext string to hash
   * @param saltOrRounds The salt to use or the number of rounds to generate a salt
   * @param callback Optional callback function
   * @returns Promise with the hashed string if no callback is provided
   */
  export function hash(data: string, saltOrRounds: string | number, callback?: (err: Error, hash: string) => void): Promise<string>;

  /**
   * Compare a plaintext string with a hash
   * @param data The plaintext string to compare
   * @param encrypted The hash to compare against
   * @param callback Optional callback function
   * @returns Promise with boolean result if no callback is provided
   */
  export function compare(data: string, encrypted: string, callback?: (err: Error, same: boolean) => void): Promise<boolean>;

  /**
   * Generate a salt
   * @param rounds Number of rounds to use, defaults to 10
   * @param callback Optional callback function
   * @returns Promise with the salt if no callback is provided
   */
  export function genSalt(rounds?: number, callback?: (err: Error, salt: string) => void): Promise<string>;

  /**
   * Gets the number of rounds used to encrypt a hash
   * @param encrypted Hash from which to extract the number of rounds used
   * @returns Number of rounds
   */
  export function getRounds(encrypted: string): number;

  /**
   * Synchronously generates a hash for the given string
   * @param data The string to hash
   * @param salt The salt to use (or rounds if number)
   */
  export function hashSync(data: string, salt: string | number): string;

  /**
   * Synchronously generates a salt
   * @param rounds Number of rounds to use, defaults to 10
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Synchronously tests a string against a hash
   * @param data The string to compare
   * @param encrypted The hash to compare against
   */
  export function compareSync(data: string, encrypted: string): boolean;

  export default {
    hash,
    hashSync,
    compare,
    compareSync,
    genSalt,
    genSaltSync,
    getRounds
  };
} 