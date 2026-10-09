import type { ValidationError } from '@nestjs/common';
import { validationExceptionFactory } from './validation-exception.factory.js';

function detailsFor(errors: Partial<ValidationError>[]) {
  const response = validationExceptionFactory(
    errors as ValidationError[],
  ).getResponse() as { code: string; details: unknown };
  expect(response.code).toBe('VALIDATION_ERROR');
  return response.details;
}

describe('validationExceptionFactory', () => {
  it('reports one message per field: missing value before format or length', () => {
    // class-validator lists constraints in reverse decorator order.
    const details = detailsFor([
      {
        property: 'email',
        constraints: {
          maxLength: 'Email môže mať najviac 254 znakov.',
          isEmail: 'Zadajte platnú emailovú adresu.',
          isNotEmpty: 'Zadajte email.',
        },
      },
    ]);

    expect(details).toEqual([{ field: 'email', message: 'Zadajte email.' }]);
  });

  it('reports a wrong type before format problems', () => {
    const details = detailsFor([
      {
        property: 'name',
        constraints: {
          length: 'Meno musí mať 2 až 50 znakov.',
          isString: 'Meno musí byť text.',
        },
      },
    ]);

    expect(details).toEqual([
      { field: 'name', message: 'Meno musí byť text.' },
    ]);
  });

  it('uses dot paths for nested fields', () => {
    const details = detailsFor([
      {
        property: 'address',
        children: [
          { property: 'city', constraints: { isNotEmpty: 'Zadajte mesto.' } },
        ],
      },
    ]);

    expect(details).toEqual([
      { field: 'address.city', message: 'Zadajte mesto.' },
    ]);
  });

  it('translates the whitelist error to Slovak', () => {
    const details = detailsFor([
      {
        property: 'isAdmin',
        constraints: {
          whitelistValidation: 'property isAdmin should not exist',
        },
      },
    ]);

    expect(details).toEqual([
      { field: 'isAdmin', message: 'Pole „isAdmin“ nie je povolené.' },
    ]);
  });
});
