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
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# This code sets the default value for the `DJANGO_SETTINGS_MODULE` environment variable to
# `'lab1.settings'` if it is not already set. It then gets the ASGI application object for the Django
# project using the `get_asgi_application()` function from `django.core.asgi`. The ASGI application
# object is used to handle incoming HTTP and WebSocket requests.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab1.settings')

django_asgi_app = get_asgi_application()

# `descView` is a variable that is assigned the result of calling the `get_schema_view` function from
# the `drf_yasg.views` module. This function returns a view function that generates a Swagger/OpenAPI
# schema for the specified API.
descView = get_schema_view(
    openapi.Info(
        title="Snippets API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# `websocket_urlpatterns` is a list of URL patterns that are used to define the application endpoints
# for the Django Channels application. It includes both WebSocket endpoints and REST API endpoints.
# Each endpoint is defined using the `path` or `re_path` function from Django's URL routing system,
# and is associated with a corresponding view or consumer function. When a WebSocket connection is
# established to one of these endpoints, the associated consumer function is called to handle the
# incoming messages. Similarly, when a REST API request is made to one of these endpoints, the
# associated view function is called to handle the request and return a response.
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
    path('api/predict/', aiPrediction.as_view()),
    path('desc/', descView.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui')
]

# This code is creating an ASGI application object that can handle both HTTP and WebSocket requests.
# It uses the `ProtocolTypeRouter` class from the `channels.routing` module to route incoming requests
# to the appropriate handler based on the protocol used.
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
