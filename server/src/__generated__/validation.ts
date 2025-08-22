/* eslint-disable */
import { z } from 'zod';
import {
  BlockUserInput,
  ChangePasswordInput,
  CreateEventInput,
  CreateGroupInput,
  CreateIndividualDoublesMatchInput,
  CreateIndividualSinglesMatchInput,
  CreateRsvpInput,
  CreateTeamLeaguePointSystemInput,
  CreateTeamMatchInput,
  CreateTennisLeagueInput,
  CreateTennisTeamInput,
  LineupInput,
  LineupSlotInput,
  LoginInput,
  SendMessageInput,
  SignupInput,
  UpdateGroupInput,
  UpdateIndividualDoublesMatchInput,
  UpdateIndividualSinglesMatchInput,
  UpdatePointSystemInput,
  UpdateTeamLeaguePointSystemInput,
  UpdateTeamMatchInput,
  UpdateTennisLeagueInput,
  UpdateTennisTeamInput,
  UpdateUserInput,
} from './types';

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine(v => isDefinedNonNullAny(v));

export const LineupSlotTypeSchema = z.enum(['DOUBLES', 'SINGLES']);

export const LineupVisibilitySchema = z.enum(['ALL', 'PRIVATE', 'TEAM']);

export const MatchTypeSchema = z.enum(['DOUBLES', 'SINGLES']);

export const RsvpStatusSchema = z.enum(['AVAILABLE', 'MAYBE', 'NOT_AVAILABLE', 'ONLY_IF_NEEDED']);

export const WinnerSchema = z.enum(['AWAY', 'HOME']);

export const ResultTypeSchema = z.enum(['C', 'D', 'NONE', 'TM']);

export const UpdateUserInputSchema: z.ZodObject<Properties<UpdateUserInput>> = z.object({
  bio: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  photoUrl: z.string().nullish(),
  username: z.string().nullish(),
});

export const UpdateTennisTeamInputSchema: z.ZodObject<Properties<UpdateTennisTeamInput>> = z.object(
  {
    captainId: z.string().nullish(),
    groupId: z.string().nullish(),
  }
);

export const UpdatePointSystemInputSchema: z.ZodObject<Properties<UpdatePointSystemInput>> =
  z.object({
    defaultDrawPoints: z.number().nullish(),
    defaultLossPoints: z.number().nullish(),
    defaultWinPoints: z.number().nullish(),
    drawPoints: z.number().nullish(),
    lossPoints: z.number().nullish(),
    winPoints: z.number().nullish(),
  });

export const UpdateGroupInputSchema: z.ZodObject<Properties<UpdateGroupInput>> = z.object({
  description: z.string().nullish(),
  isPublic: z.boolean().nullish(),
  name: z.string().nullish(),
});

export const SignupInputSchema: z.ZodObject<Properties<SignupInput>> = z.object({
  email: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  password: z.string(),
  username: z.string(),
});

export const SendMessageInputSchema: z.ZodObject<Properties<SendMessageInput>> = z.object({
  content: z.string(),
  groupId: z.string(),
});

export const LoginInputSchema: z.ZodObject<Properties<LoginInput>> = z.object({
  password: z.string(),
  username: z.string(),
});

export const LineupSlotInputSchema: z.ZodObject<Properties<LineupSlotInput>> = z.object({
  order: z.number(),
  player1Id: z.string(),
  player2Id: z.string().nullish(),
  type: LineupSlotTypeSchema,
});

export const LineupInputSchema: z.ZodObject<Properties<LineupInput>> = z.object({
  slots: z.array(z.lazy(() => LineupSlotInputSchema)),
  teamId: z.string(),
  teamMatchId: z.string(),
  visibility: LineupVisibilitySchema.nullish(),
});

export const CreateTennisTeamInputSchema: z.ZodObject<Properties<CreateTennisTeamInput>> = z.object(
  {
    captainId: z.string(),
    groupId: z.string(),
  }
);

export const UpdateTeamLeaguePointSystemInputSchema: z.ZodObject<
  Properties<UpdateTeamLeaguePointSystemInput>
> = z.object({
  drawPoints: z.number().nullish(),
  lossPoints: z.number().nullish(),
  matchType: MatchTypeSchema.nullish(),
  order: z.number().nullish(),
  winPoints: z.number().nullish(),
});

export const CreateTeamLeaguePointSystemInputSchema: z.ZodObject<
  Properties<CreateTeamLeaguePointSystemInput>
> = z.object({
  drawPoints: z.number().nullish(),
  lossPoints: z.number().nullish(),
  matchType: MatchTypeSchema,
  order: z.number(),
  winPoints: z.number(),
});

export const CreateRsvpInputSchema: z.ZodObject<Properties<CreateRsvpInput>> = z.object({
  eventId: z.string(),
  note: z.string().nullish(),
  status: RsvpStatusSchema,
});

export const CreateGroupInputSchema: z.ZodObject<Properties<CreateGroupInput>> = z.object({
  description: z.string().nullish(),
  isPublic: z.boolean().nullish(),
  name: z.string(),
});

export const ChangePasswordInputSchema: z.ZodObject<Properties<ChangePasswordInput>> = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

export const UpdateTennisLeagueInputSchema: z.ZodObject<Properties<UpdateTennisLeagueInput>> =
  z.object({
    description: z.string().nullish(),
    endDate: z.string().nullish(),
    isActive: z.boolean().nullish(),
    name: z.string().nullish(),
    startDate: z.string().nullish(),
  });

export const UpdateTeamMatchInputSchema: z.ZodObject<Properties<UpdateTeamMatchInput>> = z.object({
  awayTeamId: z.string().nullish(),
  homeTeamId: z.string().nullish(),
  matchDate: z.string().nullish(),
});

export const UpdateIndividualSinglesMatchInputSchema: z.ZodObject<
  Properties<UpdateIndividualSinglesMatchInput>
> = z.object({
  matchDate: z.string().nullish(),
  order: z.number().nullish(),
  player1Id: z.string().nullish(),
  player2Id: z.string().nullish(),
  resultType: ResultTypeSchema.nullish(),
  score: z.string().nullish(),
  teamMatchId: z.string().nullish(),
  winner: WinnerSchema.nullish(),
});

export const UpdateIndividualDoublesMatchInputSchema: z.ZodObject<
  Properties<UpdateIndividualDoublesMatchInput>
> = z.object({
  matchDate: z.string().nullish(),
  order: z.number().nullish(),
  resultType: ResultTypeSchema.nullish(),
  score: z.string().nullish(),
  team1Player1Id: z.string().nullish(),
  team1Player2Id: z.string().nullish(),
  team2Player1Id: z.string().nullish(),
  team2Player2Id: z.string().nullish(),
  teamMatchId: z.string().nullish(),
  winner: WinnerSchema.nullish(),
});

export const CreateTennisLeagueInputSchema: z.ZodObject<Properties<CreateTennisLeagueInput>> =
  z.object({
    description: z.string().nullish(),
    endDate: z.string(),
    isActive: z.boolean().nullish(),
    name: z.string(),
    startDate: z.string(),
  });

export const CreateTeamMatchInputSchema: z.ZodObject<Properties<CreateTeamMatchInput>> = z.object({
  awayTeamId: z.string(),
  homeTeamId: z.string(),
  matchDate: z.string(),
});

export const CreateIndividualSinglesMatchInputSchema: z.ZodObject<
  Properties<CreateIndividualSinglesMatchInput>
> = z.object({
  matchDate: z.string(),
  order: z.number(),
  player1Id: z.string(),
  player2Id: z.string(),
  resultType: ResultTypeSchema.nullish(),
  score: z.string(),
  teamMatchId: z.string(),
  winner: WinnerSchema.nullish(),
});

export const CreateIndividualDoublesMatchInputSchema: z.ZodObject<
  Properties<CreateIndividualDoublesMatchInput>
> = z.object({
  matchDate: z.string(),
  order: z.number(),
  resultType: ResultTypeSchema.nullish(),
  score: z.string(),
  team1Player1Id: z.string(),
  team1Player2Id: z.string(),
  team2Player1Id: z.string(),
  team2Player2Id: z.string(),
  teamMatchId: z.string(),
  winner: WinnerSchema.nullish(),
});

export const CreateEventInputSchema: z.ZodObject<Properties<CreateEventInput>> = z.object({
  date: z.string(),
  description: z.string(),
  groupId: z.string(),
});

export const BlockUserInputSchema: z.ZodObject<Properties<BlockUserInput>> = z.object({
  groupId: z.string(),
  reason: z.string().nullish(),
  userId: z.string(),
});
