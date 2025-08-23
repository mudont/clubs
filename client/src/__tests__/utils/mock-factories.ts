/**
 * Test data factories for generating realistic test data
 */

// Base factory interface
export interface TestDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
  createWithRelations(relations: Record<string, unknown>): T;
}

// Utility functions
const generateId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).substring(2, 11)}`;

const generateEmail = (): string =>
  `test_${Math.random().toString(36).substring(2, 11)}@example.com`;

const generateUsername = (): string => `testuser_${Math.random().toString(36).substring(2, 11)}`;

const generateName = (): string => {
  const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateGroupName = (): string => {
  const adjectives = [
    'Amazing',
    'Awesome',
    'Cool',
    'Dynamic',
    'Elite',
    'Fantastic',
    'Great',
    'Happy',
  ];
  const nouns = ['Club', 'Group', 'Team', 'Society', 'League', 'Community', 'Circle', 'Guild'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// User factory
export interface TestUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

export class UserFactory implements TestDataFactory<TestUser> {
  create(overrides: Partial<TestUser> = {}): TestUser {
    const fullName = generateName();
    const [firstName, lastName] = fullName.split(' ');

    return {
      id: generateId('user'),
      username: generateUsername(),
      email: generateEmail(),
      firstName,
      lastName,
      emailVerified: true,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${generateId('avatar')}`,
      bio: 'Test user bio',
      avatar: null,
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithRelations(relations: Record<string, unknown>): TestUser {
    const user = this.create();
    return { ...user, ...relations };
  }

  // Specialized factory methods
  createAdmin(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      username: 'admin_user',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      ...overrides,
    });
  }

  createUnverified(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      emailVerified: false,
      ...overrides,
    });
  }

  createWithoutOptionalFields(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      firstName: undefined,
      lastName: undefined,
      phone: undefined,
      photoUrl: undefined,
      bio: undefined,
      ...overrides,
    });
  }
}

// Group factory
export interface TestGroup {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  memberships: TestGroupMembership[];
  memberCount?: number;
  adminCount?: number;
  hasTennisLeague?: boolean;
  hasExpenseTracking?: boolean;
  hasChatEnabled?: boolean;
  isArchived?: boolean;
  hasActiveEvents?: boolean;
}

export interface TestGroupMembership {
  id: string;
  isAdmin: boolean;
  memberId: number;
  user: TestUser;
  joinedAt?: string;
}

export class GroupFactory implements TestDataFactory<TestGroup> {
  private userFactory = new UserFactory();

  create(overrides: Partial<TestGroup> = {}): TestGroup {
    const defaultUser = this.userFactory.create();
    const defaultMembership: TestGroupMembership = {
      id: generateId('membership'),
      isAdmin: true,
      memberId: 1,
      user: defaultUser,
      joinedAt: new Date().toISOString(),
    };

    const group: TestGroup = {
      id: generateId('group'),
      name: generateGroupName(),
      description: 'A test group for testing purposes',
      isPublic: Math.random() > 0.5,
      createdAt: new Date().toISOString(),
      memberships: [defaultMembership],
      memberCount: 1,
      adminCount: 1,
      hasTennisLeague: false,
      hasExpenseTracking: false,
      hasChatEnabled: true,
      isArchived: false,
      hasActiveEvents: false,
      ...overrides,
    };

    // Update counts based on memberships
    if (overrides.memberships) {
      group.memberCount = overrides.memberships.length;
      group.adminCount = overrides.memberships.filter(m => m.isAdmin).length;
    }

    return group;
  }

  createMany(count: number, overrides: Partial<TestGroup> = {}): TestGroup[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithRelations(relations: Record<string, unknown>): TestGroup {
    const group = this.create();
    return { ...group, ...relations };
  }

  // Specialized factory methods
  createPublic(overrides: Partial<TestGroup> = {}): TestGroup {
    return this.create({
      isPublic: true,
      name: 'Public Test Group',
      description: 'A public group for testing',
      ...overrides,
    });
  }

  createPrivate(overrides: Partial<TestGroup> = {}): TestGroup {
    return this.create({
      isPublic: false,
      name: 'Private Test Group',
      description: 'A private group for testing',
      ...overrides,
    });
  }

  createWithMembers(memberCount: number, overrides: Partial<TestGroup> = {}): TestGroup {
    const users = this.userFactory.createMany(memberCount);
    const memberships: TestGroupMembership[] = users.map((user, index) => ({
      id: generateId('membership'),
      isAdmin: index === 0, // First user is admin
      memberId: index + 1,
      user,
      joinedAt: new Date().toISOString(),
    }));

    return this.create({
      memberships,
      memberCount,
      adminCount: 1,
      ...overrides,
    });
  }

  createTennisGroup(overrides: Partial<TestGroup> = {}): TestGroup {
    return this.create({
      name: 'Tennis Club',
      description: 'A tennis club for competitive players',
      hasTennisLeague: true,
      ...overrides,
    });
  }

  createExpenseGroup(overrides: Partial<TestGroup> = {}): TestGroup {
    return this.create({
      name: 'Expense Sharing Group',
      description: 'A group for sharing expenses',
      hasExpenseTracking: true,
      ...overrides,
    });
  }

  createArchived(overrides: Partial<TestGroup> = {}): TestGroup {
    return this.create({
      name: 'Archived Group',
      description: 'An archived group',
      isArchived: true,
      ...overrides,
    });
  }
}

// Expense factory
export interface TestExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paidByUser: TestUser;
  splits: TestExpenseSplit[];
  groupId?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface TestExpenseSplit {
  id: string;
  amount: number;
  user: TestUser;
  isPaid?: boolean;
  paidAt?: string;
}

export class ExpenseFactory implements TestDataFactory<TestExpense> {
  private userFactory = new UserFactory();

  create(overrides: Partial<TestExpense> = {}): TestExpense {
    const paidByUser = this.userFactory.create();
    const defaultSplit: TestExpenseSplit = {
      id: generateId('split'),
      amount: 100,
      user: paidByUser,
      isPaid: false,
    };

    const categories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Utilities',
      'Shopping',
      'Travel',
    ];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

    return {
      id: generateId('expense'),
      description: 'Test expense',
      amount: Math.floor(Math.random() * 500) + 10, // $10-$510
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      date: new Date().toISOString(),
      paidByUser,
      splits: [defaultSplit],
      groupId: generateId('group'),
      receiptUrl: null,
      notes: 'Test expense notes',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<TestExpense> = {}): TestExpense[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithRelations(relations: Record<string, unknown>): TestExpense {
    const expense = this.create();
    return { ...expense, ...relations };
  }

  // Specialized factory methods
  createWithSplits(users: TestUser[], overrides: Partial<TestExpense> = {}): TestExpense {
    const paidByUser = users[0];
    const totalAmount = Math.floor(Math.random() * 500) + 10;
    const splitAmount = Math.floor(totalAmount / users.length);

    const splits: TestExpenseSplit[] = users.map(user => ({
      id: generateId('split'),
      amount: splitAmount,
      user,
      isPaid: user.id === paidByUser.id,
      paidAt: user.id === paidByUser.id ? new Date().toISOString() : undefined,
    }));

    return this.create({
      amount: totalAmount,
      paidByUser,
      splits,
      ...overrides,
    });
  }

  createLargeExpense(overrides: Partial<TestExpense> = {}): TestExpense {
    return this.create({
      description: 'Large expense',
      amount: Math.floor(Math.random() * 5000) + 1000, // $1000-$6000
      category: 'Travel',
      ...overrides,
    });
  }

  createWithReceipt(overrides: Partial<TestExpense> = {}): TestExpense {
    return this.create({
      receiptUrl: 'https://example.com/receipt.jpg',
      ...overrides,
    });
  }
}

// Tennis match factory
export interface TestTennisMatch {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  homeTeam?: TestTennisTeam;
  awayTeam?: TestTennisTeam;
  individualMatches?: TestIndividualMatch[];
  createdAt: string;
}

export interface TestTennisTeam {
  id: string;
  name: string;
  captainId: string;
  captain: TestUser;
  players: TestUser[];
}

export interface TestIndividualMatch {
  id: string;
  type: 'singles' | 'doubles';
  homePlayer1: TestUser;
  homePlayer2?: TestUser;
  awayPlayer1: TestUser;
  awayPlayer2?: TestUser;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export class TennisMatchFactory implements TestDataFactory<TestTennisMatch> {
  private userFactory = new UserFactory();

  create(overrides: Partial<TestTennisMatch> = {}): TestTennisMatch {
    const homeTeam = this.createTeam('Home Team');
    const awayTeam = this.createTeam('Away Team');

    return {
      id: generateId('match'),
      leagueId: generateId('league'),
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      matchDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random future date
      status: 'scheduled',
      homeTeam,
      awayTeam,
      individualMatches: [],
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<TestTennisMatch> = {}): TestTennisMatch[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithRelations(relations: Record<string, unknown>): TestTennisMatch {
    const match = this.create();
    return { ...match, ...relations };
  }

  private createTeam(name: string): TestTennisTeam {
    const captain = this.userFactory.create();
    const players = this.userFactory.createMany(6); // 6 players per team

    return {
      id: generateId('team'),
      name,
      captainId: captain.id,
      captain,
      players: [captain, ...players],
    };
  }

  // Specialized factory methods
  createCompleted(overrides: Partial<TestTennisMatch> = {}): TestTennisMatch {
    return this.create({
      status: 'completed',
      homeScore: Math.floor(Math.random() * 6) + 1,
      awayScore: Math.floor(Math.random() * 6) + 1,
      matchDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random past date
      ...overrides,
    });
  }

  createWithIndividualMatches(overrides: Partial<TestTennisMatch> = {}): TestTennisMatch {
    const match = this.create(overrides);
    const individualMatches: TestIndividualMatch[] = [
      // Singles matches
      {
        id: generateId('individual'),
        type: 'singles',
        homePlayer1: match.homeTeam!.players[0],
        awayPlayer1: match.awayTeam!.players[0],
        status: 'completed',
        homeScore: 6,
        awayScore: 4,
      },
      {
        id: generateId('individual'),
        type: 'singles',
        homePlayer1: match.homeTeam!.players[1],
        awayPlayer1: match.awayTeam!.players[1],
        status: 'completed',
        homeScore: 4,
        awayScore: 6,
      },
      // Doubles match
      {
        id: generateId('individual'),
        type: 'doubles',
        homePlayer1: match.homeTeam!.players[2],
        homePlayer2: match.homeTeam!.players[3],
        awayPlayer1: match.awayTeam!.players[2],
        awayPlayer2: match.awayTeam!.players[3],
        status: 'completed',
        homeScore: 6,
        awayScore: 3,
      },
    ];

    return {
      ...match,
      individualMatches,
      homeScore: 2,
      awayScore: 1,
      status: 'completed',
    };
  }
}

// Event factory
export interface TestEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  groupId: string;
  createdBy: TestUser;
  attendees: TestEventAttendee[];
  maxAttendees?: number;
  isPublic: boolean;
  createdAt: string;
}

export interface TestEventAttendee {
  id: string;
  user: TestUser;
  status: 'available' | 'not_available' | 'maybe' | 'only_if_needed';
  respondedAt: string;
}

export class EventFactory implements TestDataFactory<TestEvent> {
  private userFactory = new UserFactory();

  create(overrides: Partial<TestEvent> = {}): TestEvent {
    const createdBy = this.userFactory.create();
    const startDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    return {
      id: generateId('event'),
      title: 'Test Event',
      description: 'A test event for testing purposes',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: 'Test Location',
      groupId: generateId('group'),
      createdBy,
      attendees: [],
      maxAttendees: 20,
      isPublic: false,
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<TestEvent> = {}): TestEvent[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithRelations(relations: Record<string, unknown>): TestEvent {
    const event = this.create();
    return { ...event, ...relations };
  }

  createWithAttendees(attendeeCount: number, overrides: Partial<TestEvent> = {}): TestEvent {
    const users = this.userFactory.createMany(attendeeCount);
    const statuses: TestEventAttendee['status'][] = [
      'available',
      'not_available',
      'maybe',
      'only_if_needed',
    ];

    const attendees: TestEventAttendee[] = users.map(user => ({
      id: generateId('attendee'),
      user,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      respondedAt: new Date().toISOString(),
    }));

    return this.create({
      attendees,
      ...overrides,
    });
  }
}

// Factory registry for easy access
export const factories = {
  user: new UserFactory(),
  group: new GroupFactory(),
  expense: new ExpenseFactory(),
  tennisMatch: new TennisMatchFactory(),
  event: new EventFactory(),
};

// Convenience functions
export const createTestUser = (overrides?: Partial<TestUser>) => factories.user.create(overrides);
export const createTestGroup = (overrides?: Partial<TestGroup>) =>
  factories.group.create(overrides);
export const createTestExpense = (overrides?: Partial<TestExpense>) =>
  factories.expense.create(overrides);
export const createTestTennisMatch = (overrides?: Partial<TestTennisMatch>) =>
  factories.tennisMatch.create(overrides);
export const createTestEvent = (overrides?: Partial<TestEvent>) =>
  factories.event.create(overrides);
