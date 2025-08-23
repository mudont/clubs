import { z } from 'zod';
import { validateInput, ValidationError } from '../../../middleware/validation';

describe('Validation Middleware', () => {
  describe('validateInput', () => {
    const testSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      age: z.number().min(0, 'Age must be positive').optional(),
      tags: z.array(z.string()).optional(),
    });

    it('should validate correct input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        tags: ['user', 'active'],
      };

      const result = validateInput(testSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it('should validate input with optional fields missing', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = validateInput(testSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it('should throw ValidationError for invalid input', () => {
      const invalidInput = {
        name: '',
        email: 'invalid-email',
        age: -5,
      };

      expect(() => validateInput(testSchema, invalidInput)).toThrow(ValidationError);
    });

    it('should throw ValidationError with detailed error messages', () => {
      const invalidInput = {
        name: '',
        email: 'invalid-email',
        age: -5,
      };

      try {
        validateInput(testSchema, invalidInput);
        fail('Expected ValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toContain('Validation failed');
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle nested object validation', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          profile: z.object({
            bio: z.string().optional(),
            age: z.number(),
          }),
        }),
      });

      const validInput = {
        user: {
          name: 'John',
          profile: {
            age: 25,
          },
        },
      };

      const result = validateInput(nestedSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it('should handle array validation', () => {
      const arraySchema = z.object({
        items: z.array(
          z.object({
            id: z.string(),
            value: z.number(),
          })
        ),
      });

      const validInput = {
        items: [
          { id: '1', value: 10 },
          { id: '2', value: 20 },
        ],
      };

      const result = validateInput(arraySchema, validInput);
      expect(result).toEqual(validInput);
    });

    it('should handle enum validation', () => {
      const enumSchema = z.object({
        status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']),
      });

      const validInput = { status: 'ACTIVE' as const };
      const result = validateInput(enumSchema, validInput);
      expect(result).toEqual(validInput);

      const invalidInput = { status: 'INVALID' };
      expect(() => validateInput(enumSchema, invalidInput)).toThrow(ValidationError);
    });

    it('should handle union type validation', () => {
      const unionSchema = z.object({
        value: z.union([z.string(), z.number()]),
      });

      const stringInput = { value: 'test' };
      const numberInput = { value: 42 };

      expect(validateInput(unionSchema, stringInput)).toEqual(stringInput);
      expect(validateInput(unionSchema, numberInput)).toEqual(numberInput);

      const invalidInput = { value: true };
      expect(() => validateInput(unionSchema, invalidInput)).toThrow(ValidationError);
    });

    it('should handle date validation', () => {
      const dateSchema = z.object({
        createdAt: z.string().datetime(),
        updatedAt: z.date().optional(),
      });

      const validInput = {
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date(),
      };

      const result = validateInput(dateSchema, validInput);
      expect(result).toEqual(validInput);
    });

    it('should transform data during validation', () => {
      const transformSchema = z.object({
        name: z.string().trim().toLowerCase(),
        age: z.string().transform(val => parseInt(val, 10)),
      });

      const input = {
        name: '  JOHN DOE  ',
        age: '25',
      };

      const result = validateInput(transformSchema, input);
      expect(result.name).toBe('john doe');
      expect(result.age).toBe(25);
    });

    it('should handle custom validation rules', () => {
      const customSchema = z.object({
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain uppercase letter')
          .regex(/[a-z]/, 'Password must contain lowercase letter')
          .regex(/[0-9]/, 'Password must contain number'),
      });

      const validInput = { password: 'TestPass123' };
      expect(validateInput(customSchema, validInput)).toEqual(validInput);

      const invalidInputs = [
        { password: 'short' },
        { password: 'nouppercase123' },
        { password: 'NOLOWERCASE123' },
        { password: 'NoNumbers' },
      ];

      invalidInputs.forEach(input => {
        expect(() => validateInput(customSchema, input)).toThrow(ValidationError);
      });
    });

    it('should handle null and undefined values correctly', () => {
      const nullableSchema = z.object({
        name: z.string(),
        description: z.string().nullable(),
        tags: z.array(z.string()).optional(),
      });

      const validInputs = [
        { name: 'Test', description: null },
        { name: 'Test', description: 'Some description' },
        { name: 'Test', description: null, tags: ['tag1'] },
      ];

      validInputs.forEach(input => {
        expect(() => validateInput(nullableSchema, input)).not.toThrow();
      });
    });

    it('should provide detailed error information', () => {
      const complexSchema = z.object({
        user: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          preferences: z.object({
            theme: z.enum(['light', 'dark']),
            notifications: z.boolean(),
          }),
        }),
        items: z.array(
          z.object({
            id: z.string(),
            quantity: z.number().positive(),
          })
        ),
      });

      const invalidInput = {
        user: {
          name: '',
          email: 'invalid',
          preferences: {
            theme: 'invalid',
            notifications: 'not-boolean',
          },
        },
        items: [
          { id: '', quantity: -1 },
          { id: 'valid', quantity: 0 },
        ],
      };

      try {
        validateInput(complexSchema, invalidInput);
        fail('Expected ValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);

        // Check that error paths are included
        const errorPaths = error.errors.map((e: any) => e.path?.join('.'));
        expect(errorPaths).toContain('user.name');
        expect(errorPaths).toContain('user.email');
      }
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with message and errors', () => {
      const errors = [
        { path: ['name'], message: 'Name is required' },
        { path: ['email'], message: 'Invalid email' },
      ];

      const error = new ValidationError('Validation failed', errors);

      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be catchable as Error', () => {
      const error = new ValidationError('Test error', []);

      try {
        throw error;
      } catch (caught) {
        expect(caught).toBeInstanceOf(Error);
        expect(caught).toBeInstanceOf(ValidationError);
        expect(caught.message).toBe('Test error');
      }
    });
  });
});
