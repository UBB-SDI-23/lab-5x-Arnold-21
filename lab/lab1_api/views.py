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
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = StadiumLogic.getPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(StadiumLogic.getAutocompleteStadium(nameParam))
        
        pageNumber = int(pageNumber)
        if nameParam is None:
            return Response(StadiumLogic.getPagedStadiums(pageNumber))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)

class stadiumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer
    lookup_field = 'id'

#Club----------------------------------------------------------------------------------------------------------------------
class clubList(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        budgetFilterParam = request.query_params.get("budgetFilter")

        if rowParam is not None and budgetFilterParam is not None:
            rowNumber = ClubLogic.getBudgetFilteredPageNumber(budgetFilterParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)
        elif rowParam is not None:
            rowNumber = ClubLogic.getPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(ClubLogic.getAutocompleteClub(nameParam))
        
        pageNumber = int(pageNumber)
        if nameParam is None and budgetFilterParam is None:
            return Response(ClubLogic.getPagedClubs(pageNumber))
        elif nameParam is None:
            return Response(ClubLogic.filterClubByAnnualBudget(budgetFilterParam, pageNumber))
        
        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)

class clubDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer
    lookup_field = 'id'

    def get(self, request, id,*args, **kwargs):
        return Response(ClubLogic.getSingleClubWithLeague(id))
    
class clubWithLeague(APIView):
    def post(self, request, *args, **kwargs):
        club = request.data
        error = ClubLogic.saveClubWithLeague(club)

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
    
#Statics for clubs by Stadium
class clubStadiumCapacity(APIView):
    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = ClubLogic.getStadiumCapacityStatisticsPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        return Response(ClubLogic.getStadiumCapacityStatistics(pageNumber))

#Competition-----------------------------------------------------------------------------------------------------------------
class competitionList(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = CompetitionLogic.getPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(CompetitionLogic.getAutocompleteComps(nameParam))
        
        pageNumber = int(pageNumber)
        if nameParam is None:
            return Response(CompetitionLogic.getPagedComps(pageNumber))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
        
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
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = MatchesPlayedLogic.getPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("date")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(MatchesPlayedLogic.getAutocompleteDates(nameParam))
        
        pageNumber = int(pageNumber)
        if nameParam is None:
            return Response(MatchesPlayedLogic.getPagedMatches(pageNumber))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)


class matchesPlayedDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer
    lookup_field = 'id'

    def get(self, request, id, *args, **kwargs):
        return Response(MatchesPlayedLogic.getSingleMatchPlayedWithDetail(id))

class specificCompetitionMatchesDetail(APIView):
    def get(self, request, compId, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = MatchesPlayedLogic.getCompetitionSpecificPageNumber(compId)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        return Response(MatchesPlayedLogic.getCompetitionSpecificMatch(compId, pageNumber))
    
    def post(self, request, compId,*args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.saveCompetitionSpecificMatch(data, compId)
        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, compId, *args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.updateCompetitionSpecificMatch(data)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, compId, *args, **kwargs):
        MatchesPlayedLogic.deleteCompetitionSpecificMatch(compId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    

class specificClubMatchesDetail(APIView):
    def get(self, request, clubId, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = MatchesPlayedLogic.getClubSpecificPageNumber(clubId)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        return Response(MatchesPlayedLogic.getClubSpecificMatch(clubId, pageNumber))
    
    def post(self, request, clubId,*args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.saveClubSpecificMatch(data, clubId)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
    def put(self, request, clubId, *args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.updateClubSpecificMatch(data)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, clubId, *args, **kwargs):
        MatchesPlayedLogic.deleteClubSpecificMatch(clubId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    
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
        data = request.data
        error = MatchesPlayedLogic.updateClubAndCompetitionSpecificMatch(data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, compSpecId, clubSpecId, *args, **kwargs):
        MatchesPlayedLogic.deleteClubAndCompetitionSpecificMatch(compSpecId, clubSpecId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)

#LeaguesByAverage---------------------------------------------------------------------------------------------------------------------
class leaguesByAverage(APIView):
    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        if rowParam is not None:
            rowNumber = CompetitionLogic.getLeaguesByClubAnnualBudgetPageNumber()
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        return Response(CompetitionLogic.getLeaguesByClubAnnualBudget(pageNumber))
