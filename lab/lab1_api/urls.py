from django.urls import path
from .views import *

urlpatterns = [
    path('stadiums/', stadiumList.as_view()),
    path('stadiums/<int:id>/', stadiumDetail.as_view()),
    path('clubs/', clubList.as_view()),
    path('clubs/<int:id>/', clubDetail.as_view()),
    path('clubs/league', clubWithLeague.as_view()),
    path('clubs/competitions', clubsWithCompetitionMatches.as_view()),
    path('clubs/filter/<int:budget>/', clubFilteredList.as_view()),
    path('competitions/', competitionList.as_view()),
    path('competitions/<int:id>/', competitionDetail.as_view()),
    path('competitions/clubs', CompetitionWithClubMatches.as_view()),
    path('competitions/leagueClubs', competitionWithLeagueClubs.as_view()),
    path('matches/', matchesPlayedList.as_view()),
    path('matches/<int:id>/', matchesPlayedDetail.as_view()),
    path('competitions/clubs/<int:compSpecId>/<int:clubSpecId>', verySpecificMatchesDetail.as_view()),
    path('clubs/<int:clubId>/competitions', specificClubMatchesDetail.as_view()),
    path('competitions/<int:compId>/clubs', specificCompetitionMatchesDetail.as_view()),
    path('leaguesByAnnualBudget', leaguesByAverage.as_view()),
    path('clubsByStadiumCapacity', clubStadiumCapacity.as_view()),
    path('updateClubLeagues/<int:compID>', UpdateClubLeagues.as_view())
]