import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
  } | null;
  pubsub: PubSub;
}
