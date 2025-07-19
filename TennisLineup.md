# Line up

Team Captains (Group Admins) in Tennis Leagues need create lineups for each Team Match. Line up describes who is playing First Singles, Second singles, first doubles and so on.
Lineup for a match should be visible only to the Admins until it is "Published to Team", at which point anyone in the team can see. visibility should be an enum ("Private", "Team", "All").

Once both teams publish lineup to "All", the Individual matches for the Team Match should be created by some trigger on the backend.

The UI for creating the lineup should use Drag and Drop.
On the left, show the RSVPs

Lineup will be on the right. show boxes for S1, S2, S3, D1, D2, D3, D4, D5. S for indivudal singles, D for individual Doubles, the numbers for Order. A higher numbered slot cannot be filled unless lower numbered slots have been filled. The Singles boxes take one player and Doubles boxes take two players. Both must be filled in order to move to the next order value.

Admin may drag names from RSVP list (unless they are Not Available) to the Lineup
