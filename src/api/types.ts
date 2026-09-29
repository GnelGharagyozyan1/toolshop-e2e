export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: Address;
}

export interface RegisteredUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TestUser extends RegisteredUser {
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
