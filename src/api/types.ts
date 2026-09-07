/**
 * Request and response shapes for the Toolshop API.
 *
 * These aren't decoration. They're the contract, written down. When the API
 * changes a field name, TypeScript fails at compile time instead of your test
 * failing at runtime with `undefined`.
 */

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

/** Payload for POST /users/register */
export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  dob: string; // ISO date, e.g. '1990-05-14'
  phone: string;
  email: string;
  password: string;
  address: Address;
}

/** What the API gives back after registration. */
export interface RegisteredUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * A user we created, PLUS the password we used.
 *
 * The API never returns a password — but tests need it to log in through the
 * UI afterwards. This type keeps the two together so no test has to remember
 * which password went with which account.
 */
export interface TestUser extends RegisteredUser {
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
