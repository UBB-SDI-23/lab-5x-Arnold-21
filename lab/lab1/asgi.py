"""
ASGI config for lab1 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path, path
from lab1_api.consumers import TextRoomConsumer
from lab1_api.views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab1.settings')

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
    path('api/admin/userdetail/<int:id>/', updateUserPagination.as_view()),
    path('api/predict/', aiPrediction.as_view())
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
