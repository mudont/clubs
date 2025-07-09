-- Rename tables to snake_case
ALTER TABLE "User"
  RENAME TO "users";
ALTER TABLE "AuthAccount"
  RENAME TO "auth_accounts";
ALTER TABLE "Club"
  RENAME TO "clubs";
ALTER TABLE "Membership"
  RENAME TO "memberships";
ALTER TABLE "Event"
  RENAME TO "events";
ALTER TABLE "RSVP"
  RENAME TO "rsvps";
ALTER TABLE "Message"
  RENAME TO "messages";
-- Rename columns in users table
ALTER TABLE "users"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users"
  RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users"
  RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users"
  RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "users"
  RENAME COLUMN "photoUrl" TO "photo_url";
ALTER TABLE "users"
  RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "users"
  RENAME COLUMN "lastName" TO "last_name";
ALTER TABLE "users"
  RENAME COLUMN "resetPasswordToken" TO "reset_password_token";
ALTER TABLE "users"
  RENAME COLUMN "resetPasswordTokenExpires" TO "reset_password_token_expires";
-- Rename columns in auth_accounts table
ALTER TABLE "auth_accounts"
  RENAME COLUMN "providerUserId" TO "provider_user_id";
ALTER TABLE "auth_accounts"
  RENAME COLUMN "userId" TO "user_id";
-- Rename columns in clubs table
ALTER TABLE "clubs"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "clubs"
  RENAME COLUMN "updatedAt" TO "updated_at";
-- Rename columns in memberships table
ALTER TABLE "memberships"
  RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "memberships"
  RENAME COLUMN "clubId" TO "club_id";
ALTER TABLE "memberships"
  RENAME COLUMN "isAdmin" TO "is_admin";
ALTER TABLE "memberships"
  RENAME COLUMN "memberId" TO "member_id";
ALTER TABLE "memberships"
  RENAME COLUMN "joinedAt" TO "joined_at";
-- Rename columns in events table
ALTER TABLE "events"
  RENAME COLUMN "clubId" TO "club_id";
ALTER TABLE "events"
  RENAME COLUMN "createdById" TO "created_by_id";
-- Rename columns in rsvps table
ALTER TABLE "rsvps"
  RENAME COLUMN "eventId" TO "event_id";
ALTER TABLE "rsvps"
  RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "rsvps"
  RENAME COLUMN "createdAt" TO "created_at";
-- Rename columns in messages table
ALTER TABLE "messages"
  RENAME COLUMN "clubId" TO "club_id";
ALTER TABLE "messages"
  RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "messages"
  RENAME COLUMN "createdAt" TO "created_at";
