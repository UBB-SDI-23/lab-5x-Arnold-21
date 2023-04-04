from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db.models import Avg

from .service import *

#Crud functionalities for the models--------------------------------------------------------------------------------------------------------------------------------------

#Stadium-------------------------------------------------------------------------------
class stadiumList(generics.ListCreateAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer

    def get(self, request, *args, **kwargs):
        nameParam = request.query_params.get("name")
        if nameParam is None:
            nameParam = ""
        return Response(StadiumLogic.getStadiumFilteredByName(nameParam))

class stadiumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer
    lookup_field = 'id'

#Club----------------------------------------------------------------------------------------------------------------------
class clubList(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer

    def get(self, request, *args, **kwargs):
        return Response(ClubLogic.getClubsWithLeagues())

class clubDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer
    lookup_field = 'id'

    def get(self, request, id,*args, **kwargs):
        return Response(ClubLogic.getSingleClubWithLeague(id))
    
class clubWithLeague(APIView):
    def post(self, request, *args, **kwargs):
        club = request.data
        error = ClubLogic.saveCubWithLeague(club)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_201_CREATED)
    
class clubsWithCompetitionMatches(APIView):
    def post(self, request, *args, **kwargs):
        club = request.data
        error = ClubLogic.saveClubWithCompetitions(club)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_201_CREATED)

#Filter class for clubs
class clubFilteredList(APIView):
    def get(self, request, budget, format=None):
        return Response(ClubLogic.filterClubByAnnualBudget(budget))
    

#Statics for clubs by Stadium
class clubStadiumCapacity(generics.ListAPIView):
    serializer_class = simpleClubSerializer

    def get_queryset(self):
        return ClubLogic.getStadiumCapacityQuery()

#Competition-----------------------------------------------------------------------------------------------------------------
class competitionList(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer

    def get(self, request, *args, **kwargs):
        return Response(CompetitionLogic.getCompetitionsWithLeagueClubs())


class competitionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer
    lookup_field = 'id'

    def get(self, request, id, *args, **kwargs):
        return Response(CompetitionLogic.getsingleCompetitionWithLeagueClub(id))
    
class competitionWithLeagueClubs(APIView):
    def post(self, request, *args, **kwargs):
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithLeagueClubs(comp)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
class CompetitionWithClubMatches(APIView):
    def post(self, request, *args, **kwargs):
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithClubMatcehs(comp)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
class UpdateClubLeagues(APIView):
    def put(self, request, compID, *args, **kwargs):
        clubs = request.data
        error = CompetitionLogic.updateClubLeagues(clubs, compID)

        if error:
            return Response({}, status=status.HTTP_424_FAILED_DEPENDENCY)
        return Response({}, status=status.HTTP_201_CREATED)


#MatchesPlayed------------------------------------------------------------------------------------------------------------------------
class matchesPlayedList(generics.ListCreateAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer

    def get(self, request, *args, **kwargs):
        return Response(MatchesPlayedLogic.getMatchesWithDetail())


class matchesPlayedDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer
    lookup_field = 'id'

    def get(self, request, id, *args, **kwargs):
        return Response(MatchesPlayedLogic.getSingleMatchPlayedWithDetail(id))


class specificCompetitionMatchesDetail(APIView):
    def get(self, request, compId, *args, **kwargs):
        return Response(MatchesPlayedLogic.getCompetitionSpecificMatch(compId))
    
    def post(self, request, compId,*args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.saveCompetitionSpecificMatch(data, compId)
        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    

class specificClubMatchesDetail(APIView):
    def get(self, request, clubId, *args, **kwargs):
        return Response(MatchesPlayedLogic.getClubSpecificMatch(clubId))
    
    def post(self, request, clubId,*args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.saveClubSpecificMatch(data, clubId)
        
        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
class verySpecificMatchesDetail(APIView):
    def get(self, request, compSpecId, clubSpecId, *args, **kwargs):
        return Response(MatchesPlayedLogic.getClubAndCompetitionSpecificMatch(clubSpecId, compSpecId))
    
    def post(self, request, compSpecId, clubSpecId, *args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.saveClubAndCompetitionSpecificMatch(data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, compSpecId, clubSpecId, *args, **kwargs):
        mat = MatchesPlayed.objects.get(Q(club1=clubSpecId) & Q(competition=compSpecId))
        data = request.data
        error = MatchesPlayedLogic.updateClubAndCompetitionSpecificMatch(data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, compSpecId, clubSpecId, *args, **kwargs):
        MatchesPlayedLogic.deleteClubAndCompetitionSpecificMatch(compSpecId, clubSpecId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)

#LeaguesByAverage---------------------------------------------------------------------------------------------------------------------
class leaguesByAverage(generics.ListAPIView):
    serializer_class = simpleCompetitionSerializer

    #Making the query for the statistical report 
    def get_queryset(self):
        return CompetitionLogic.getLeaguesByClubAnnualBudgetQuery()
