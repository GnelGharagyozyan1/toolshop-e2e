import { faker } from '@faker-js/faker';
import type { RegisterUserRequest } from '@api/types';

/**
 * Builds registration payloads.
 *
 * THE RULE: randomize what doesn't matter, fix what does.
 *
 * Names, emails, and addresses are random because their content is irrelevant
 * to almost every test — what matters is that they're UNIQUE, so parallel
 * tests never collide on the same account.
 *
 * The password is deliberately NOT random. It has to satisfy the app's
 * complexity policy, and a randomly generated one might not. Randomizing a
 * value that has validation rules attached buys you nothing and costs you
 * intermittent failures — which you'll then spend a day misdiagnosing as
 * flakiness.
 *
 * THE OVERRIDES PARAMETER is what makes this a factory rather than a fixed
 * blob. A test that cares about one specific field sets just that field and
 * lets everything else be generated:
 *
 *   buildUser({ email: 'duplicate@example.com' })
 *
 * The test then reads as a statement about what it's testing. Everything not
 * mentioned is, by definition, irrelevant to it.
 */

const VALID_PASSWORD = 'Pass$w0rd1';

export function buildUser(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    first_name: firstName,
    last_name: lastName,

    // A timestamp guarantees uniqueness even if faker repeats itself.
    // Random alone is not a uniqueness guarantee — collisions happen, and
    // they surface as a baffling "email already taken" once a month.
    email:
      `${firstName}.${lastName}.${Date.now()}.${faker.string.alphanumeric(6)}@example.com`.toLowerCase(),

    password: VALID_PASSWORD,

    // The app requires users to be adults, so bound the range rather than
    // generating any date and hoping.
    dob: faker.date.birthdate({ min: 20, max: 60, mode: 'age' }).toISOString().split('T')[0]!,

    phone: faker.string.numeric(10),

    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: faker.string.numeric(5),
    },

    // Spread last so overrides win.
    ...overrides,
  };
}
