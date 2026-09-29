import type { APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import type { RegisterUserRequest, RegisteredUser, LoginResponse, TestUser } from './types';

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

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

  async registerAndLogin(payload: RegisterUserRequest): Promise<{ user: TestUser; token: string }> {
    const user = await this.register(payload);
    const token = await this.login(payload.email, payload.password);
    return { user, token };
  }

  async deleteUser(userId: string, adminToken: string): Promise<boolean> {
    const response = await this.request.delete(`${env.apiURL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    return response.ok();
  }
}
