/**
 * Email validation function that checks if the provided string is in valid email format
 * @param email The email string to validate
 * @returns A boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password validation function that checks if the password meets minimum requirements
 * @param password The password string to validate
 * @returns A boolean indicating if the password is valid
 */
export function isValidPassword(password: string): boolean {
  // Password should be at least 6 characters
  return password.length >= 6;
}

/**
 * Validation function to check if the passwords match
 * @param password The original password
 * @param confirmPassword The confirmation password
 * @returns A boolean indicating if the passwords match
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
} 