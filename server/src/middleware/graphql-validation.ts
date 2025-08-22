import { GraphQLError } from 'graphql';
import { ZodSchema } from 'zod';
import * as ValidationSchemas from '../__generated__/validation';
import { logError } from '../utils/logger';
import { validateInput } from './validation';

/**
 * Mapping of GraphQL operations to their validation schemas
 */
const OPERATION_VALIDATION_MAP: Record<
  string,
  {
    input?: ZodSchema<any>;
  }
> = {
  // Tennis League Operations
  createTennisLeague: {
    input: ValidationSchemas.CreateTennisLeagueInputSchema,
  },
  updateTennisLeague: {
    input: ValidationSchemas.UpdateTennisLeagueInputSchema,
  },
  createTennisTeam: {
    input: ValidationSchemas.CreateTennisTeamInputSchema,
  },
  updateTennisTeam: {
    input: ValidationSchemas.UpdateTennisTeamInputSchema,
  },
  createTeamMatch: {
    input: ValidationSchemas.CreateTeamMatchInputSchema,
  },
  updateTeamMatch: {
    input: ValidationSchemas.UpdateTeamMatchInputSchema,
  },
  createIndividualSinglesMatch: {
    input: ValidationSchemas.CreateIndividualSinglesMatchInputSchema,
  },
  updateIndividualSinglesMatch: {
    input: ValidationSchemas.UpdateIndividualSinglesMatchInputSchema,
  },
  createIndividualDoublesMatch: {
    input: ValidationSchemas.CreateIndividualDoublesMatchInputSchema,
  },
  updateIndividualDoublesMatch: {
    input: ValidationSchemas.UpdateIndividualDoublesMatchInputSchema,
  },
  updatePointSystem: {
    input: ValidationSchemas.UpdatePointSystemInputSchema,
  },
  createTeamLeaguePointSystem: {
    input: ValidationSchemas.CreateTeamLeaguePointSystemInputSchema,
  },
  updateTeamLeaguePointSystem: {
    input: ValidationSchemas.UpdateTeamLeaguePointSystemInputSchema,
  },
  createOrUpdateLineup: {
    input: ValidationSchemas.LineupInputSchema,
  },
  // Group Operations
  createGroup: {
    input: ValidationSchemas.CreateGroupInputSchema,
  },
  updateGroup: {
    input: ValidationSchemas.UpdateGroupInputSchema,
  },
  blockUser: {
    input: ValidationSchemas.BlockUserInputSchema,
  },
  // Event Operations
  createEvent: {
    input: ValidationSchemas.CreateEventInputSchema,
  },
  createRSVP: {
    input: ValidationSchemas.CreateRsvpInputSchema,
  },
  // Message Operations
  sendMessage: {
    input: ValidationSchemas.SendMessageInputSchema,
  },
  // User Operations
  updateProfile: {
    input: ValidationSchemas.UpdateUserInputSchema,
  },
  login: {
    input: ValidationSchemas.LoginInputSchema,
  },
  signup: {
    input: ValidationSchemas.SignupInputSchema,
  },
  changePassword: {
    input: ValidationSchemas.ChangePasswordInputSchema,
  },
};

/**
 * Creates a validation wrapper for GraphQL resolvers
 */
export function createValidationWrapper(operationName: string, resolver: any): any {
  const validationConfig = OPERATION_VALIDATION_MAP[operationName];

  if (!validationConfig) {
    // No validation configured for this operation, return resolver as-is
    return resolver;
  }

  return async function validatedResolver(source: any, args: any, context: any, info: any) {
    try {
      let validatedArgs = args;

      // Validate input if schema is configured
      if (validationConfig.input) {
        // For operations with nested input objects, validate the input field
        if (args && typeof args === 'object' && 'input' in args) {
          validatedArgs = {
            ...args,
            input: validateInput(validationConfig.input, args.input),
          };
        } else {
          // For operations where args themselves are the input
          validatedArgs = validateInput(validationConfig.input, args);
        }
      }

      // Execute the resolver with validated arguments
      const result = await resolver(source, validatedArgs, context, info);

      return result;
    } catch (error) {
      // Re-throw GraphQL errors as-is
      if (error instanceof GraphQLError) {
        throw error;
      }

      // Log unexpected errors
      logError(`Validation error in ${operationName}`, error as Error, {
        args,
        operationName,
      });

      throw new GraphQLError(`Validation failed for ${operationName}`, {
        extensions: {
          code: 'VALIDATION_ERROR',
          originalError: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

/**
 * Applies validation to all resolvers in a resolver map
 */
export function applyValidationToResolvers(resolvers: any): any {
  const validatedResolvers = { ...resolvers };

  // Apply validation to Query resolvers
  if (validatedResolvers.Query) {
    for (const [fieldName, resolver] of Object.entries(validatedResolvers.Query)) {
      if (typeof resolver === 'function') {
        validatedResolvers.Query[fieldName] = createValidationWrapper(fieldName, resolver);
      }
    }
  }

  // Apply validation to Mutation resolvers
  if (validatedResolvers.Mutation) {
    for (const [fieldName, resolver] of Object.entries(validatedResolvers.Mutation)) {
      if (typeof resolver === 'function') {
        validatedResolvers.Mutation[fieldName] = createValidationWrapper(fieldName, resolver);
      }
    }
  }

  // Apply validation to Subscription resolvers
  if (validatedResolvers.Subscription) {
    for (const [fieldName, resolver] of Object.entries(validatedResolvers.Subscription)) {
      if (typeof resolver === 'function') {
        validatedResolvers.Subscription[fieldName] = createValidationWrapper(fieldName, resolver);
      }
    }
  }

  return validatedResolvers;
}

/**
 * Validates specific input types commonly used across resolvers
 */
export const commonValidators = {
  validateId: (id: string) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new GraphQLError('Invalid ID provided', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    return id.trim();
  },

  validatePagination: (limit?: number, offset?: number) => {
    const validatedLimit = limit && limit > 0 ? Math.min(limit, 100) : 50; // Max 100 items
    const validatedOffset = offset && offset >= 0 ? offset : 0;

    return { limit: validatedLimit, offset: validatedOffset };
  },

  validateDateRange: (startDate?: string, endDate?: string) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new GraphQLError('Invalid date format', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (start >= end) {
        throw new GraphQLError('Start date must be before end date', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    }
  },
};
