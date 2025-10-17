import { decodeJwt } from 'jose';

/**
 * Decode a JWT token without verification (client-side only)
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - The decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    return decodeJwt(token);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

/**
 * Get token expiration date
 * @param {string} token - The JWT token to check
 * @returns {Date|null} - The expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * Get user information from JWT token
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - User info or null if invalid
 */
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role
  };
};




