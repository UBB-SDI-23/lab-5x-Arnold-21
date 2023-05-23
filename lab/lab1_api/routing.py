from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path, path
from .consumers import TextRoomConsumer
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    re_path(r'^ws/(?P<room_name>[^/]+)/$', TextRoomConsumer.as_asgi()),
    path('api/stadiums/', stadiumList.as_view()),
    path('api/stadiums/<int:id>/', stadiumDetail.as_view()),
    path('api/clubs/', clubList.as_view()),
    path('api/clubs/<int:id>/', clubDetail.as_view()),
    path('api/clubs/league/', clubWithLeague.as_view()),
    path('api/clubs/competitions/', clubsWithCompetitionMatches.as_view()),
    path('api/competitions/', competitionList.as_view()),
    path('api/competitions/<int:id>/', competitionDetail.as_view()),
    path('api/competitions/clubs/', CompetitionWithClubMatches.as_view()),
    path('api/competitions/leagueClubs/', competitionWithLeagueClubs.as_view()),
    path('api/matches/', matchesPlayedList.as_view()),
    path('api/matches/<int:id>/', matchesPlayedDetail.as_view()),
    path('api/competitions/clubs/<int:compSpecId>/<int:clubSpecId>', verySpecificMatchesDetail.as_view()),
    path('api/clubs/<int:clubId>/competitions/', specificClubMatchesDetail.as_view()),
    path('api/competitions/<int:compId>/clubs/', specificCompetitionMatchesDetail.as_view()),
    path('api/leaguesByAnnualBudget/', leaguesByAverage.as_view()),
    path('api/clubsByStadiumCapacity/', clubStadiumCapacity.as_view()),
    path('api/updateClubLeagues/<int:compID>/', UpdateClubLeagues.as_view()),
    path('api/token/', myTokenObtainPariView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view()),
    path('api/register/confirm/<int:code>/', RegisterConfirmView.as_view()),
    path('api/user/<int:id>/', userDetailList.as_view()),
    path('api/admin/user/', userList.as_view()),
    path('api/admin/user/<int:id>/', userDetail.as_view()),
    path('api/admin/stadiums/', bulkStadium.as_view()),
    path('api/admin/clubs/', bulkClub.as_view()),
    path('api/admin/competitions/', bulkCompetition.as_view()),
    path('api/admin/matchs/', bulkMatch.as_view()),
    path('api/admin/userdetail/<int:id>/', updateUserPagination.as_view())
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket':
        URLRouter(
            websocket_urlpatterns
        )
    ,
})