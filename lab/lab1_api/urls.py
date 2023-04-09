from django.urls import path
from .views import *

urlpatterns = [
    path('api/stadiums/', stadiumList.as_view()),
    path('api/stadiums/<int:id>/', stadiumDetail.as_view()),
    path('api/clubs/', clubList.as_view()),
    path('api/clubs/<int:id>/', clubDetail.as_view()),
    path('api/clubs/league', clubWithLeague.as_view()),
    path('api/clubs/competitions', clubsWithCompetitionMatches.as_view()),
    path('api/clubs/filter/<int:budget>/', clubFilteredList.as_view()),
    path('api/competitions/', competitionList.as_view()),
    path('api/competitions/<int:id>/', competitionDetail.as_view()),
    path('api/competitions/clubs', CompetitionWithClubMatches.as_view()),
    path('api/competitions/leagueClubs', competitionWithLeagueClubs.as_view()),
    path('api/matches/', matchesPlayedList.as_view()),
    path('api/matches/<int:id>/', matchesPlayedDetail.as_view()),
    path('api/competitions/clubs/<int:compSpecId>/<int:clubSpecId>', verySpecificMatchesDetail.as_view()),
    path('api/clubs/<int:clubId>/competitions', specificClubMatchesDetail.as_view()),
    path('api/competitions/<int:compId>/clubs', specificCompetitionMatchesDetail.as_view()),
    path('api/leaguesByAnnualBudget', leaguesByAverage.as_view()),
    path('api/clubsByStadiumCapacity', clubStadiumCapacity.as_view()),
    path('api/updateClubLeagues/<int:compID>', UpdateClubLeagues.as_view())
]