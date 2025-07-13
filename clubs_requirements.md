# Clubs app

## Application features

Create Fullstack app to support social and sports clubs.

Authentication, use Google, Facebook and password methods for sign up and login.
Users should be able to edit their profiles, edit username, password, email (must be verified), phone, add a photo, link same user account to all login methods (google, facebook, password)

User should be able to create Groups(Clubs). A group/club contain 1 or more users. The creator automatically becomes an admin for the club and can add members (users). Any admin can give admin privileges to other members. Members should be assigned a numeric member id that is unique within a club. Need ability to add/delete members (users)

Add a realtime group chat feature where all members of a club can see everyone's posts.

A Club admin should be able to create events with date and description. Only Members of a club should be able to see events belonging to the club. Members should be able to RSVP with one of "Available", "Not available", "Maybe", "Only if needed" , and add an optional note

## Technologies

Use Typescript, fully functional, enforced with strictest possible lint settings.
Use React, GraphQL, PostgreSQL, Prisma
Use Redux, Redux-observable if they are applicable
Use GraphQL subscriptions for information pushed from server.

dockerize and give instructions on deploying to an ubuntu/nginx/tls server

## Design suggestions

Factor aggressively, prefer a lot of small components, functions and files to large ones.
Client must be a PWA, must be responsive, look good on phones and on desktops
User lowercase, singular names for database tables

Allow groups to be public (users can join on their own). The Dashboard should show first the clubs that the user belongs to, and then all public clubs to which user does not belong and from which the user has not been blocked. These public groups should be displayed along with button to Join.
A membership can be blocked by an admin, in which case, they are not treated as members and they are prevented from joining.

