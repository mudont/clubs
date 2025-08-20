import { GraphQLError } from 'graphql';
import { ZodError, ZodSchema } from 'zod';
import { logError } from '../utils/logger';

/**
 * Validates input data against a Zod schema
 */
export function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      logError('Input validation failed', error, {
        data,
        errors: error.errors,
      });

      throw new GraphQLError(`Input validation failed: ${errorMessages}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          validationErrors: error.errors,
        },
      });
    }
    throw error;
  }
}

/**
 * Validates output data against a Zod schema (development only)
 */
export function validateOutput<T>(schema: ZodSchema<T>, data: unknown, operationName: string): T {
  if (process.env.NODE_ENV === 'production') {
    return data as T;
  }

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      logError(`Output validation failed for ${operationName}`, error, {
        data,
        errors: error.errors,
      });

      // In development, we want to know about output validation failures
      // but we don't want to break the API for users
      console.warn(`⚠️  Output validation failed for ${operationName}:`, error.errors);
    }
    return data as T;
  }
}

/**
 * Creates a resolver wrapper that validates inputs and outputs
 */
export function withValidation<TArgs, TResult>(
  inputSchema: ZodSchema<TArgs> | null,
  outputSchema: ZodSchema<TResult> | null,
  operationName: string
) {
  return function validationWrapper(
    resolver: (parent: any, args: TArgs, context: any, info: any) => Promise<TResult> | TResult
  ) {
    return async function validatedResolver(parent: any, args: any, context: any, info: any) {
      // Validate input
      const validatedArgs = inputSchema ? validateInput(inputSchema, args) : args;

      // Execute resolver
      const result = await resolver(parent, validatedArgs, context, info);

      // Validate output (development only)
      const validatedResult = outputSchema
        ? validateOutput(outputSchema, result, operationName)
        : result;

      return validatedResult;
    };
  };
}

/**
 * Validates nested input objects
 */
export function validateNestedInput<T>(schema: ZodSchema<T>, data: unknown, fieldPath: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map(err => `${fieldPath}.${err.path.join('.')}: ${err.message}`)
        .join(', ');

      throw new GraphQLError(`Validation failed: ${errorMessages}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          validationErrors: error.errors,
          fieldPath,
        },
      });
    }
    throw error;
  }
}
