import { faker } from '@faker-js/faker';
import type { RegisterUserRequest } from '@api/types';

const VALID_PASSWORD = 'Pass$w0rd1';

export function buildUser(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    first_name: firstName,
    last_name: lastName,

    email:
      `${firstName}.${lastName}.${Date.now()}.${faker.string.alphanumeric(6)}@example.com`.toLowerCase(),

    password: VALID_PASSWORD,

    dob: faker.date.birthdate({ min: 20, max: 60, mode: 'age' }).toISOString().split('T')[0]!,

    phone: faker.string.numeric(10),

    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: faker.string.numeric(5),
    },

    ...overrides,
  };
}
