# Tennis module
Try to keep the code for Tennis module separate from the parent application

## Entities of imprtance in Tennis module

### TeamLeague
Multiple Teams (represented by groups in parent application) participate in a Team League,
which is identified by a name, year, season . Season is just any text

### TeamLeaguePointSystem
Team league, type (singles or doubles), order (1,2,3...)
win_points (integer)


### TeamLeagueMember
Mebers of the league are called teams in tennis context. They are groups in parent application

### TeamLeagueTeamMatch
Identified by a TeamLeague, date, a home team and an away team

### TeamLeagueIndividualSinglesMatch
Identified by a TeamLeagueTeamMatch, order (1,2,...)
home_player (must belong to home team)
away_player (must belong to away team)
score (text)
winner (home or away or null if unknown)

### TeamLeagueIndividualDoublesMatch
Identified by a TeamLeagueTeamMatch, order (1,2,3,...)
home_player1 (must belong to home team)
home_player2 (must belong to home team)
away_player1 (must belong to away team)
away_player2 (must belong to away team)
score (text)
winner (home or away or null if unknown)



## UI
Need UI to manage all teh entitities

In adition a League standings page showing the points earned by each team

ana
