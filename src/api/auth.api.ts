import type { APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import type { RegisterUserRequest, RegisteredUser, LoginResponse, TestUser } from './types';

/**
 * Client for the authentication endpoints.
 *
 * DESIGN NOTES
 *
 * 1. It takes an APIRequestContext rather than creating one. That's dependency
 *    injection — the caller decides whether to hand it a fresh context, or the
 *    one from a browser page. Makes this class trivially reusable.
 *
 * 2. Every method FAILS LOUDLY on a bad response, including the body in the
 *    error. A test-data helper that returns undefined on failure produces a
 *    confusing UI failure ten steps later; one that throws immediately points
 *    straight at the cause. Test infrastructure should be maximally noisy.
 *
 * 3. No assertions. `expect` belongs in tests. This throws plain Errors, so it
 *    can be used in fixtures and setup where `expect` would be out of place.
 */
export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  /** Create a new user account. Returns the created user. */
  async register(payload: RegisterUserRequest): Promise<TestUser> {
    const response = await this.request.post(`${env.apiURL}/users/register`, {
      data: payload,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to register ${payload.email}: ${response.status()} ${await response.text()}`,
      );
    }

    const user = (await response.json()) as RegisteredUser;

    // Carry the password forward — the API won't return it, but tests need it.
    return { ...user, password: payload.password };
  }

  /** Authenticate and return the raw JWT. */
  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${env.apiURL}/users/login`, {
      data: { email, password },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to log in as ${email}: ${response.status()} ${await response.text()}`,
      );
    }

    const body = (await response.json()) as LoginResponse;
    return body.access_token;
  }

  /**
   * Register and log in in one step.
   * Returns the user plus a ready-to-use token.
   */
  async registerAndLogin(payload: RegisterUserRequest): Promise<{ user: TestUser; token: string }> {
    const user = await this.register(payload);
    const token = await this.login(payload.email, payload.password);
    return { user, token };
  }
  /**
   * Delete a user. Requires an ADMIN bearer token — a user cannot delete
   * themselves through this endpoint.
   *
   * Returns `true` on success, `false` on failure. Deliberately does NOT throw:
   * this is called from teardown, and a throwing teardown turns a passing test
   * red for a reason unrelated to what it tested. See the `newUser` fixture for
   * the full reasoning.
   */
  async deleteUser(userId: string, adminToken: string): Promise<boolean> {
    const response = await this.request.delete(`${env.apiURL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    return response.ok();
  }
}
