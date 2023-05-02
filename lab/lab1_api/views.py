from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from .service import *
from rest_framework_simplejwt.views import TokenObtainPairView

#Views for the user authentification

class myTokenObtainPariView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        error = UserLogic.saveUser(data)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_200_OK)

class RegisterConfirmView(APIView):
    def get(self, request, code, *args, **kwargs):
        error = UserLogic.confirmRegistration(code)
        if error:
            return Response({'Message': "Confirmation Unsuccessful!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_200_OK)

#Crud functionalities for the models--------------------------------------------------------------------------------------------------------------------------------------

#Stadium-------------------------------------------------------------------------------
class stadiumList(generics.ListCreateAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = StadiumLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(StadiumLogic.getAutocompleteStadium(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK)     
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(StadiumLogic.getPagedStadiums(pageNumber, rowParam))

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
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and budgetFilterParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getBudgetFilteredPageNumber(budgetFilterParam, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)
        elif rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(ClubLogic.getAutocompleteClub(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None and budgetFilterParam is None:
            return Response(ClubLogic.getPagedClubs(pageNumber, rowParam))
        elif nameParam is None:
            return Response(ClubLogic.filterClubByAnnualBudget(budgetFilterParam, pageNumber, rowParam))
        
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
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getStadiumCapacityStatisticsPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(ClubLogic.getStadiumCapacityStatistics(pageNumber, rowParam))

#Competition-----------------------------------------------------------------------------------------------------------------
class competitionList(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = CompetitionLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

       
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(CompetitionLogic.getAutocompleteComps(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(CompetitionLogic.getPagedComps(pageNumber, rowParam))

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
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("date")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)
        
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "":
            return Response(MatchesPlayedLogic.getAutocompleteDates(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(MatchesPlayedLogic.getPagedMatches(pageNumber, rowParam))

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
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getCompetitionSpecificPageNumber(compId, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(MatchesPlayedLogic.getCompetitionSpecificMatch(compId, pageNumber, rowParam))
    
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
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getClubSpecificPageNumber(clubId, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(MatchesPlayedLogic.getClubSpecificMatch(clubId, pageNumber, rowParam))
    
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
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None:
            rowParam = int(rowParam)
            rowNumber = CompetitionLogic.getLeaguesByClubAnnualBudgetPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(CompetitionLogic.getLeaguesByClubAnnualBudget(pageNumber, rowParam))
