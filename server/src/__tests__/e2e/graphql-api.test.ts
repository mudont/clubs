import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import request from 'supertest';
import resolvers from '../../resolvers';
import { typeDefs } from '../../schema';
import { Context } from '../../types/context';
import { createTestUser, generateTestToken } from '../helpers/test-utils';
import { prisma } from '../setup';

describe('GraphQL API End-to-End Tests', () => {
  let app: express.Application;
  let server: ApolloServer<Context>;

  beforeAll(async () => {
    // Create Apollo Server
    server = new ApolloServer<Context>({
      typeDefs,
      resolvers,
    });

    await server.start();

    // Create Express app
    app = express();
    app.use(express.json());

    // Add GraphQL middleware
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          let user = null;

          // Extract token from Authorization header
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            // In a real app, you'd verify the token here
            // For tests, we'll decode it directly
            try {
              const jwt = require('jsonwebtoken');
              const decoded = jwt.verify(token, process.env.JWT_SECRET!);
              user = await prisma.user.findUnique({
                where: { id: decoded.id },
              });
            } catch (error) {
              // Invalid token, user remains null
            }
          }

          return {
            user,
            prisma,
            req,
            res: null,
          };
        },
      })
    );
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Authentication Flow', () => {
    it('should signup a new user', async () => {
      const signupMutation = `
        mutation Signup($input: SignupInput!) {
          signup(input: $input) {
            token
            user {
              id
              email
              username
              firstName
              lastName
              emailVerified
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'e2e-test@example.com',
          username: 'e2euser',
          password: 'TestPassword123!',
          firstName: 'E2E',
          lastName: 'Test',
        },
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: signupMutation,
          variables,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signup).toBeDefined();
      expect(response.body.data.signup.token).toBeDefined();
      expect(response.body.data.signup.user.email).toBe(variables.input.email);
      expect(response.body.data.signup.user.username).toBe(variables.input.username);
      expect(response.body.data.signup.user.firstName).toBe(variables.input.firstName);
      expect(response.body.data.signup.user.lastName).toBe(variables.input.lastName);
      expect(response.body.data.signup.user.emailVerified).toBe(false);
    });

    it('should login with valid credentials', async () => {
      // Create a test user first
      const testUser = await createTestUser({
        email: 'login-test@example.com',
        username: 'loginuser',
        emailVerified: true,
      });

      const loginMutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
              username
            }
          }
        }
      `;

      const variables = {
        input: {
          username: testUser.email,
          password: 'TestPassword123!', // Default password from createTestUser
        },
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: loginMutation,
          variables,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.login).toBeDefined();
      expect(response.body.data.login.token).toBeDefined();
      expect(response.body.data.login.user.id).toBe(testUser.id);
      expect(response.body.data.login.user.email).toBe(testUser.email);
    });

    it('should reject login with invalid credentials', async () => {
      const loginMutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
            }
          }
        }
      `;

      const variables = {
        input: {
          username: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        },
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: loginMutation,
          variables,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid credentials');
    });

    it('should return current user with me query when authenticated', async () => {
      const testUser = await createTestUser();
      const token = generateTestToken(testUser);

      const meQuery = `
        query Me {
          me {
            id
            email
            username
            firstName
            lastName
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: meQuery })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.me).toBeDefined();
      expect(response.body.data.me.id).toBe(testUser.id);
      expect(response.body.data.me.email).toBe(testUser.email);
    });

    it('should return null for me query when not authenticated', async () => {
      const meQuery = `
        query Me {
          me {
            id
            email
          }
        }
      `;

      const response = await request(app).post('/graphql').send({ query: meQuery }).expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.me).toBeNull();
    });
  });

  describe('Group Management Flow', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(async () => {
      testUser = await createTestUser();
      authToken = generateTestToken(testUser);
    });

    it('should create a new group', async () => {
      const createGroupMutation = `
        mutation CreateGroup($input: CreateGroupInput!) {
          createGroup(input: $input) {
            id
            name
            description
            isPublic
            memberships {
              user {
                id
              }
              isAdmin
            }
          }
        }
      `;

      const variables = {
        input: {
          name: 'E2E Test Group',
          description: 'A group created in E2E tests',
          isPublic: true,
        },
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: createGroupMutation,
          variables,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createGroup).toBeDefined();
      expect(response.body.data.createGroup.name).toBe(variables.input.name);
      expect(response.body.data.createGroup.description).toBe(variables.input.description);
      expect(response.body.data.createGroup.isPublic).toBe(variables.input.isPublic);
      expect(response.body.data.createGroup.memberships).toHaveLength(1);
      expect(response.body.data.createGroup.memberships[0].user.id).toBe(testUser.id);
      expect(response.body.data.createGroup.memberships[0].isAdmin).toBe(true);
    });

    it('should join a public group', async () => {
      // Create a public group first
      const group = await prisma.group.create({
        data: {
          name: 'Public Group for Joining',
          isPublic: true,
        },
      });

      const joinGroupMutation = `
        mutation JoinGroup($groupId: ID!) {
          joinGroup(groupId: $groupId) {
            id
            name
            memberships {
              user {
                id
              }
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: joinGroupMutation,
          variables: { groupId: group.id },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.joinGroup).toBeDefined();
      expect(response.body.data.joinGroup.id).toBe(group.id);
      expect(response.body.data.joinGroup.memberships).toHaveLength(1);
      expect(response.body.data.joinGroup.memberships[0].user.id).toBe(testUser.id);
    });

    it("should get user's groups", async () => {
      // Create groups and memberships
      const group1 = await prisma.group.create({
        data: { name: 'User Group 1' },
      });
      const group2 = await prisma.group.create({
        data: { name: 'User Group 2' },
      });

      await prisma.membership.create({
        data: {
          userId: testUser.id,
          groupId: group1.id,
          memberId: 1,
        },
      });
      await prisma.membership.create({
        data: {
          userId: testUser.id,
          groupId: group2.id,
          memberId: 1,
        },
      });

      const myGroupsQuery = `
        query MyGroups {
          myGroups {
            id
            name
            memberships {
              user {
                id
              }
              isAdmin
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: myGroupsQuery })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.myGroups).toHaveLength(2);
      expect(response.body.data.myGroups.map((g: any) => g.name)).toContain('User Group 1');
      expect(response.body.data.myGroups.map((g: any) => g.name)).toContain('User Group 2');
    });

    it('should get public groups with search', async () => {
      // Create test groups
      await prisma.group.createMany({
        data: [
          { name: 'Tennis Club', description: 'For tennis players', isPublic: true },
          { name: 'Book Club', description: 'For book lovers', isPublic: true },
          { name: 'Private Club', description: 'Secret club', isPublic: false },
        ],
      });

      const publicGroupsQuery = `
        query PublicGroups($query: String) {
          publicGroups(query: $query) {
            id
            name
            description
            isPublic
          }
        }
      `;

      // Test without search
      const allPublicResponse = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: publicGroupsQuery })
        .expect(200);

      expect(allPublicResponse.body.data.publicGroups).toHaveLength(2);
      expect(allPublicResponse.body.data.publicGroups.every((g: any) => g.isPublic)).toBe(true);

      // Test with search
      const searchResponse = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: publicGroupsQuery,
          variables: { query: 'Tennis' },
        })
        .expect(200);

      expect(searchResponse.body.data.publicGroups).toHaveLength(1);
      expect(searchResponse.body.data.publicGroups[0].name).toBe('Tennis Club');
    });
  });

  describe('Error Handling', () => {
    it('should handle GraphQL syntax errors', async () => {
      const invalidQuery = `
        query {
          me {
            id
            invalidField
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Cannot query field');
    });

    it('should handle authentication errors', async () => {
      const protectedQuery = `
        mutation CreateGroup($input: CreateGroupInput!) {
          createGroup(input: $input) {
            id
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({
          query: protectedQuery,
          variables: {
            input: { name: 'Test Group' },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Authentication required');
    });

    it('should handle validation errors', async () => {
      const testUser = await createTestUser();
      const token = generateTestToken(testUser);

      const invalidMutation = `
        mutation CreateGroup($input: CreateGroupInput!) {
          createGroup(input: $input) {
            id
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: invalidMutation,
          variables: {
            input: { name: '' }, // Invalid: empty name
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Validation failed');
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ invalidField: 'invalid' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Complex Queries', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(async () => {
      testUser = await createTestUser();
      authToken = generateTestToken(testUser);
    });

    it('should handle nested queries with relationships', async () => {
      // Create test data
      const group = await prisma.group.create({
        data: { name: 'Test Group with Relations' },
      });

      await prisma.membership.create({
        data: {
          userId: testUser.id,
          groupId: group.id,
          memberId: 1,
          isAdmin: true,
        },
      });

      await prisma.event.create({
        data: {
          groupId: group.id,
          createdById: testUser.id,
          date: new Date(),
          description: 'Test Event',
        },
      });

      const complexQuery = `
        query ComplexGroupQuery {
          myGroups {
            id
            name
            memberships {
              user {
                id
                username
                email
              }
              isAdmin
              joinedAt
            }
            events {
              id
              description
              date
              createdBy {
                id
                username
              }
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: complexQuery })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.myGroups).toHaveLength(1);

      const group_result = response.body.data.myGroups[0];
      expect(group_result.memberships).toHaveLength(1);
      expect(group_result.memberships[0].user.id).toBe(testUser.id);
      expect(group_result.memberships[0].isAdmin).toBe(true);
      expect(group_result.events).toHaveLength(1);
      expect(group_result.events[0].createdBy.id).toBe(testUser.id);
    });

    it('should handle multiple mutations in sequence', async () => {
      const sequentialMutations = `
        mutation SequentialMutations($groupInput: CreateGroupInput!, $updateInput: UpdateUserInput!) {
          createGroup(input: $groupInput) {
            id
            name
          }
          updateProfile(input: $updateInput) {
            id
            firstName
            lastName
          }
        }
      `;

      const variables = {
        groupInput: {
          name: 'Sequential Test Group',
          description: 'Created in sequential mutation',
        },
        updateInput: {
          firstName: 'Updated',
          lastName: 'Name',
        },
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: sequentialMutations,
          variables,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createGroup).toBeDefined();
      expect(response.body.data.createGroup.name).toBe(variables.groupInput.name);
      expect(response.body.data.updateProfile).toBeDefined();
      expect(response.body.data.updateProfile.firstName).toBe(variables.updateInput.firstName);
      expect(response.body.data.updateProfile.lastName).toBe(variables.updateInput.lastName);
    });
  });
});
