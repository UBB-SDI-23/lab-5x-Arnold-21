from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from .service import *
from rest_framework_simplejwt.views import TokenObtainPairView
import re
from .permissions import *
from django.contrib.auth import get_user_model

User = get_user_model()

#Validation functions
def checkNumber(number):
    if re.search("^[0-9]*$",number):
        return True
    return False

def checkName(name):
    if re.search("^[a-zA-Z0-9]*$", name):
        return True
    return False

#Views for the user authentification

class myTokenObtainPariView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        error = UserLogic.saveUser(data)

        if error:
            return Response({"error": "Invalid username, email or password"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_200_OK)

class RegisterConfirmView(APIView):
    def get(self, request, code, *args, **kwargs):
        error = UserLogic.confirmRegistration(code)
        if error:
            return Response({'Message': "Confirmation Unsuccessful!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_200_OK)

#Crud functionalities for the models--------------------------------------------------------------------------------------------------------------------------------------

#User
class userDetailList(APIView):
    def get(self, request, id, *args, **kwargs):
        if id < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserLogic.getUserDetail(id))
    
class userList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, isAdmin]

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = UserLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_400_BAD_REQUEST)

        if pageNumber is None and nameParam != "" and checkName(nameParam):
            return Response(UserLogic.getAutocompleteUser(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK)     
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(UserLogic.getPagedUsers(pageNumber, rowParam))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, *args, **kwargs):
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request,*args,**kwargs)
    
class userDetail(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated, isAdmin]

    def put(self, request, id, *args, **kwargs):
        self.check_permissions(request=request)
        return Response(UserLogic.updateUserRole(id, request.data))

#Stadium-------------------------------------------------------------------------------
class stadiumList(generics.ListCreateAPIView):
    queryset = Stadium.objects.all()
    serializer_class = simpleStadiumSerializer
    
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = StadiumLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_400_BAD_REQUEST)

        if pageNumber is None and nameParam != "" and checkName(nameParam):
            return Response(StadiumLogic.getAutocompleteStadium(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK)     
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(StadiumLogic.getPagedStadiums(pageNumber, rowParam))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, *args, **kwargs):
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request,*args,**kwargs)

class stadiumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer
    lookup_field = 'id'

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]

    def put(self, request, *args, **kwargs):
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().put(request,*args,**kwargs)

#Club----------------------------------------------------------------------------------------------------------------------
class clubList(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        budgetFilterParam = request.query_params.get("budgetFilter")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and budgetFilterParam is not None and pageNumber is None and checkNumber(rowParam) and checkNumber(budgetFilterParam):
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getBudgetFilteredPageNumber(budgetFilterParam, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)
        elif rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "" and checkName(nameParam):
            return Response(ClubLogic.getAutocompleteClub(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None and budgetFilterParam is None:
            return Response(ClubLogic.getPagedClubs(pageNumber, rowParam))
        elif nameParam is None and checkNumber(budgetFilterParam):
            return Response(ClubLogic.filterClubByAnnualBudget(budgetFilterParam, pageNumber, rowParam))
        
        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, *args, **kwargs):
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request,*args,**kwargs)

class clubDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer
    lookup_field = 'id'

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]

    def get(self, request, id,*args, **kwargs):
        if id < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ClubLogic.getSingleClubWithLeague(id))
    
    def put(self, request, *args, **kwargs):
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().put(request,*args,**kwargs)
    
class clubWithLeague(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        club = request.data
        error = ClubLogic.saveClubWithLeague(club)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_201_CREATED)
    
class clubsWithCompetitionMatches(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
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

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = ClubLogic.getStadiumCapacityStatisticsPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(ClubLogic.getStadiumCapacityStatistics(pageNumber, rowParam))

#Competition-----------------------------------------------------------------------------------------------------------------
class competitionList(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("name")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = CompetitionLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

       
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "" and checkName(nameParam):
            return Response(CompetitionLogic.getAutocompleteComps(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(CompetitionLogic.getPagedComps(pageNumber, rowParam))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, *args, **kwargs):
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request,*args,**kwargs)
        
class competitionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer
    lookup_field = 'id'

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]

    def get(self, request, id, *args, **kwargs):
        if id < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CompetitionLogic.getsingleCompetitionWithLeagueClub(id))
    
    def put(self, request, *args, **kwargs):
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().put(request,*args,**kwargs)
    
class competitionWithLeagueClubs(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithLeagueClubs(comp)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
class CompetitionWithClubMatches(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithClubMatcehs(comp)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
class UpdateClubLeagues(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def put(self, request, compID, *args, **kwargs):
        self.check_permissions(request=request)

        if compID < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        clubs = request.data
        error = CompetitionLogic.updateClubLeagues(self, request, clubs, compID)

        if error:
            return Response({}, status=status.HTTP_424_FAILED_DEPENDENCY)
        return Response({}, status=status.HTTP_201_CREATED)


#MatchesPlayed------------------------------------------------------------------------------------------------------------------------
class matchesPlayedList(generics.ListCreateAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")
        nameParam = request.query_params.get("date")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)
        
        if pageNumber is None and nameParam is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)

        if pageNumber is None and nameParam != "" and checkName(nameParam):
            return Response(MatchesPlayedLogic.getAutocompleteDates(nameParam))
        elif pageNumber is None:
            return Response([{}], status=status.HTTP_200_OK) 
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        if nameParam is None:
            return Response(MatchesPlayedLogic.getPagedMatches(pageNumber, rowParam))

        return Response({}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, *args, **kwargs):
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request,*args,**kwargs)


class matchesPlayedDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer
    lookup_field = 'id'

    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]

    def get(self, request, id, *args, **kwargs):
        if id < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatchesPlayedLogic.getSingleMatchPlayedWithDetail(id))
    
    def put(self, request, *args, **kwargs):
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        return super().put(request,*args,**kwargs)

class specificCompetitionMatchesDetail(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, compId, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam) and compId > 0:
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getCompetitionSpecificPageNumber(compId, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(MatchesPlayedLogic.getCompetitionSpecificMatch(compId, pageNumber, rowParam))
    
    def post(self, request, compId,*args, **kwargs):
        self.check_permissions(request=request)

        if compId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.saveCompetitionSpecificMatch(data, compId)
        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, compId, *args, **kwargs):
        self.check_permissions(request=request)

        if compId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.updateCompetitionSpecificMatch(self, request, data)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, compId, *args, **kwargs):
        self.check_permissions(request=request)

        if compId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteCompetitionSpecificMatch(compId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    

class specificClubMatchesDetail(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, clubId, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = MatchesPlayedLogic.getClubSpecificPageNumber(clubId, rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(MatchesPlayedLogic.getClubSpecificMatch(clubId, pageNumber, rowParam))
    
    def post(self, request, clubId,*args, **kwargs):
        self.check_permissions(request=request)

        if clubId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.saveClubSpecificMatch(data, clubId)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
    def put(self, request, clubId, *args, **kwargs):
        self.check_permissions(request=request)

        if clubId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        if "user" in request.data:
            return Response({"error": "User given"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.updateClubSpecificMatch(self, request, data, clubId)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, clubId, *args, **kwargs):
        self.check_permissions(request=request)

        if clubId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteClubSpecificMatch(clubId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    
class verySpecificMatchesDetail(APIView):
    def get_permissions(self):
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, compSpecId, clubSpecId, *args, **kwargs):
        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(MatchesPlayedLogic.getClubAndCompetitionSpecificMatch(clubSpecId, compSpecId))
    
    def post(self, request, compSpecId, clubSpecId, *args, **kwargs):
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.saveClubAndCompetitionSpecificMatch(data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, compSpecId, clubSpecId, *args, **kwargs):
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.updateClubAndCompetitionSpecificMatch(self, request, data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, compSpecId, clubSpecId, *args, **kwargs):
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteClubAndCompetitionSpecificMatch(compSpecId, clubSpecId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)

#LeaguesByAverage---------------------------------------------------------------------------------------------------------------------
class leaguesByAverage(APIView):
    def get(self, request, *args, **kwargs):
        rowParam = request.query_params.get("pageNumber")
        pageNumber = request.query_params.get("page")

        if rowParam is not None and pageNumber is None and checkNumber(rowParam):
            rowParam = int(rowParam)
            rowNumber = CompetitionLogic.getLeaguesByClubAnnualBudgetPageNumber(rowParam)
            return Response({"pageNumber": rowNumber}, status=status.HTTP_200_OK)

        if pageNumber is None:
            return Response({"response": "No page recieved"}, status=status.HTTP_200_OK)
        
        if not checkNumber(pageNumber) or not checkNumber(rowParam):
            return Response({"error": "Invalid arguments"}, status=status.HTTP_400_BAD_REQUEST)
        pageNumber = int(pageNumber)
        rowParam = int(rowParam)
        return Response(CompetitionLogic.getLeaguesByClubAnnualBudget(pageNumber, rowParam))
    

#Admin-----------------------------------------------------------------------------------------------------------------------------------
class bulkStadium(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        StadiumLogic.bulkDelete(request.data.get("stadiums"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
class bulkClub(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        ClubLogic.bulkDelete(request.data.get("clubs"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
class bulkCompetition(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        CompetitionLogic.bulkDelete(request.data.get("competitions"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
class bulkMatch(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        MatchesPlayedLogic.bulkDelete(request.data.get("matches"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)


class updateUserPagination(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def put(self, request, id, *args, **kwargs):
        self.check_permissions(request=request)
        if (request.data.get("pagination") != 12 and request.data.get("pagination") != 20 and request.data.get("pagination") != 40):
            Response({"error": "Wrong pagination"}, status=status.HTTP_400_BAD_REQUEST)
        if id < 0:
            Response({"error": "Invalid ip"}, status=status.HTTP_400_BAD_REQUEST)

        UserLogic.updatePagination(id, request.data)
        
        return Response({"res": "Pagination Updated"}, status=status.HTTP_200_OK)