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
    """
    The function checks if a given input is a number or not using regular expressions in Python.
    
    :param number: The input parameter to the function "checkNumber". It is expected to be a string
    representing a number. The function checks if the string contains only digits (0-9) and returns True
    if it does, else it returns False
    :return: a boolean value. It returns True if the input parameter "number" contains only digits
    (0-9), and False otherwise.
    """
    if re.search("^[0-9]*$",number):
        return True
    return False

def checkName(name):
    """
    The function checks if a given string only contains alphanumeric characters.
    
    :param name: The input string that needs to be checked for containing only alphanumeric characters
    :return: a boolean value. It returns True if the input string 'name' contains only alphanumeric
    characters (letters and/or numbers), and False otherwise.
    """
    if re.search("^[a-zA-Z0-9]*$", name):
        return True
    return False

#Views for the user authentification

# This is a custom view class that extends the TokenObtainPairView and uses a custom serializer called
# MyTokenObtainPairSerializer.
class myTokenObtainPariView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# This is a class that handles user registration and returns an error response if the provided data is
# invalid.
class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        error = UserLogic.saveUser(data)

        if error:
            return Response({"error": "Invalid username, email or password"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_200_OK)

# This is a class-based view in Python that confirms user registration by checking a code and returns
# an appropriate response.
class RegisterConfirmView(APIView):
    def get(self, request, code, *args, **kwargs):
        error = UserLogic.confirmRegistration(code)
        if error:
            return Response({'Message': "Confirmation Unsuccessful!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_200_OK)

#Crud functionalities for the models--------------------------------------------------------------------------------------------------------------------------------------

#User
# This is a class that retrieves user details based on a given ID and returns an error message if the
# ID is invalid.
class userDetailList(APIView):
    def get(self, request, id, *args, **kwargs):
        if id < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserLogic.getUserDetail(id))
    
# This is a class that handles GET and POST requests for a user list, with pagination and search
# functionality.
class userList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, isAdmin]

    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles GET requests for pagination and autocomplete
        functionality for a user database.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: It depends on the input parameters and conditions. The function returns a Response
        object with different data and status codes based on the conditions and input parameters.
        """
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
    
# This is a class that handles retrieving and updating user details, with permission checks and a
# custom logic for updating user roles.
class userDetail(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated, isAdmin]

    def put(self, request, id, *args, **kwargs):
        self.check_permissions(request=request)
        return Response(UserLogic.updateUserRole(id, request.data))

#Stadium-------------------------------------------------------------------------------
# This is a class that handles GET and POST requests for a list of stadiums, with different parameters
# for filtering and pagination.
class stadiumList(generics.ListCreateAPIView):
    queryset = Stadium.objects.all()
    serializer_class = simpleStadiumSerializer
    
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles HTTP GET requests for a stadium API, allowing for
        pagination and autocomplete search.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: The code returns different responses based on the conditions met in the if statements.
        It could return a JSON response with a "pageNumber" key and value, a JSON response with a list
        of stadiums, a JSON response with an error message, or a JSON response with an empty dictionary.
        """
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

# This is a class-based view in Django REST framework that handles retrieving, updating, and deleting
# stadium details, with different permissions for different HTTP methods.
class stadiumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stadium.objects.all()
    serializer_class = StadiumSerializer
    lookup_field = 'id'

    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes instantiated as objects. The specific permission classes
        added to the list depend on the HTTP method of the request.
        """
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
# This is a Django REST framework API view that handles GET and POST requests for a Club model, with
# various filtering and pagination options.
class clubList(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer

    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles GET requests with various query parameters to retrieve
        data from a database of clubs.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: It is not clear what is being returned as it depends on the conditions met in the
        if-else statements. The function returns a Response object with different data and status codes
        based on the conditions.
        """
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

# This is a class-based view in Django REST framework that retrieves, updates, and deletes a single
# club object, with different permissions for different HTTP methods.
class clubDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = simpleClubSerializer
    lookup_field = 'id'

    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes instantiated as objects. The specific permission classes
        added to the list depend on the HTTP method of the request.
        """
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
    
# This is a Django REST framework API view that saves a club with a league and requires authentication
# and regular user permissions for POST requests.
class clubWithLeague(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        """
        This is a Django REST Framework view function that saves a club with a league and returns an
        appropriate response.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: If the "user" is not given in the request data, a response with an error message "User
        not given" and status code 400 (Bad Request) is returned. If there is an error while saving the
        club with league, an empty response with status code 400 (Bad Request) is returned. Otherwise,
        an empty response with status code 201 (Created) is returned.
        """
        self.check_permissions(request=request)
        
        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        club = request.data
        error = ClubLogic.saveClubWithLeague(club)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_201_CREATED)
    
# This is a Django REST framework API view that saves a club with competition matches and checks for
# permissions before doing so.
class clubsWithCompetitionMatches(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        """
        This is a Django REST Framework view function that saves a club with competitions and returns an
        appropriate response.
        
        :param request: an HTTP request object containing information about the request made by the
        client
        :return: If the "user" is not given in the request data, a response with an error message "User
        not given" and status code 400 (Bad Request) is returned. If there is an error while saving the
        club with competitions, an empty response with status code 400 is returned. Otherwise, an empty
        response with status code 201 (Created) is returned.
        """
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        club = request.data
        error = ClubLogic.saveClubWithCompetitions(club)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({}, status=status.HTTP_201_CREATED)
    
#Statics for clubs by Stadium
# This is a Python class that handles requests for retrieving stadium capacity statistics for a club,
# including pagination.
class clubStadiumCapacity(APIView):
    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles GET requests and returns stadium capacity statistics based
        on the page number and row parameter provided in the request.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: The code returns a response object with either a page number or stadium capacity
        statistics depending on the query parameters received in the GET request. If the query parameters
        are invalid, it returns an error response with a 400 status code.
        """
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
# This is a class for handling GET and POST requests for a list of competitions, with permissions and
# pagination.
class competitionList(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer

    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles HTTP GET requests for a competition API, allowing for
        pagination and autocomplete functionality.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: It depends on the conditions being met. If the first condition is met, a JSON response
        with a "pageNumber" key and its corresponding value is returned. If the second condition is met,
        a JSON response with a "response" key and its corresponding value is returned. If the third
        condition is met, a JSON response with a list containing an empty dictionary is returned. If the
        fourth condition is met
        """
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
        
# This is a class-based view in Django REST framework that handles retrieving, updating, and deleting
# a competition object, with different permissions for different HTTP methods.
class competitionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Competition.objects.all()
    serializer_class = simpleCompetitionSerializer
    lookup_field = 'id'

    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes instantiated as objects. The specific permission classes
        added to the list depend on the HTTP method of the request.
        """
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
    
# This is a class that handles the creation of a competition with league clubs and checks for
# appropriate permissions before allowing the creation.
class competitionWithLeagueClubs(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        """
        This is a Python function that saves a competition with league clubs and returns a response with
        an error message or a success status code.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: If the "user" is not given in the request data, a response with an error message "User
        not given" and status code 400 (Bad Request) is returned. If there is an error while saving the
        competition with league clubs, an empty response with status code 400 (Bad Request) is returned.
        Otherwise, an empty response with status code 201 (Created) is returned.
        """
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithLeagueClubs(comp)

        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
# This is a Python class that defines the permissions and functionality for creating a competition
# with club matches through a POST request.
class CompetitionWithClubMatches(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def post(self, request, *args, **kwargs):
        """
        This is a Python function that saves a competition with club matches and returns a response with
        an error message or a success status code.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: If the "user" is not given in the request data, a response with an error message "User
        not given" and status code 400 (Bad Request) is returned. If there is an error while saving the
        competition with club matches, an empty response with status code 400 (Bad Request) is returned.
        Otherwise, an empty response with status code 201 (Created) is returned.
        """
        self.check_permissions(request=request)

        if "user" not in request.data or request.data["user"] is None:
            return Response({"error": "User not given"}, status=status.HTTP_400_BAD_REQUEST)
        comp = request.data
        error = CompetitionLogic.saveCompetitionWithClubMatcehs(comp)
        
        if error:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_201_CREATED)
    
# This is a class that updates club leagues for a competition using PUT request with authentication
# and permission checks.
class UpdateClubLeagues(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds IsAuthenticated
        and isRegular permissions for PUT requests.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'PUT': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]
    
    def put(self, request, compID, *args, **kwargs):
        """
        This function updates the leagues of clubs in a competition and returns an appropriate response.
        
        :param request: The HTTP request object that contains information about the request made by the
        client, such as the HTTP method, headers, and data
        :param compID: compID is a parameter that represents the ID of a competition. It is used in the
        function to identify the competition that needs to be updated
        :return: If the `compID` is less than 0, a response with an error message and status code 400 is
        returned. If there is an error in updating the club leagues, an empty response with status code
        424 is returned. Otherwise, an empty response with status code 201 is returned.
        """
        self.check_permissions(request=request)

        if compID < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        clubs = request.data
        error = CompetitionLogic.updateClubLeagues(self, request, clubs, compID)

        if error:
            return Response({}, status=status.HTTP_424_FAILED_DEPENDENCY)
        return Response({}, status=status.HTTP_201_CREATED)


#MatchesPlayed------------------------------------------------------------------------------------------------------------------------
# This is a class that handles GET and POST requests for a list of matches played, with various
# parameters for filtering and pagination.
class matchesPlayedList(generics.ListCreateAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer

    def get_permissions(self):
        """
        This function returns a list of permissions based on the request method and adds two permissions
        to the list if the request method is POST.
        :return: A list of permission classes instantiated as objects.
        """
        permissions_list = []
        if self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        return [permission() for permission in permissions_list]

    def get(self, request, *args, **kwargs):
        """
        This is a Python function that handles HTTP GET requests with various query parameters and
        returns responses accordingly.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: It depends on the conditions met in the if statements. If the first if statement is
        met, a dictionary with a "pageNumber" key and its value is returned with a status code of 200.
        If the second if statement is met, a dictionary with a "response" key and its value is returned
        with a status code of 200. If the third if statement is met, a list with
        """
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
            return Response([{"test": pageNumber}], status=status.HTTP_200_OK) 
        
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


# This is a class-based view in Django REST framework that handles retrieving, updating, and deleting
# a single instance of a MatchesPlayed model, with different permissions for PUT and DELETE requests.
class matchesPlayedDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MatchesPlayed.objects.all()
    serializer_class = simpleMatchesPlayedSerializer
    lookup_field = 'id'

    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes that are instantiated.
        """
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

# This is a class that handles API requests for specific competition matches, including getting,
# posting, updating, and deleting matches, and checking permissions for each request.
class specificCompetitionMatchesDetail(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes that are instantiated.
        """
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, compId, *args, **kwargs):
        """
        This is a Python function that retrieves a specific page number or a specific match for a given
        competition ID.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :param compId: The ID of a competition
        :return: The code returns a response object with either a page number or a list of matches
        played in a specific competition, depending on the parameters passed in the request. If the
        parameters are invalid, it returns an error response.
        """
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
        """
        This function saves a competition specific match and returns a response with an error message if
        there is an issue.
        
        :param request: The HTTP request object containing metadata about the request, such as headers,
        method, and body
        :param compId: The ID of the competition for which the match data is being saved
        :return: If the `compId` is less than 0 or if the "user" key is not present in the request data
        or if it is None, then a response with an error message and status code 400 (Bad Request) is
        returned. Otherwise, the `saveCompetitionSpecificMatch` method is called with the request data
        and `compId`. If there is an error, an empty
        """
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
        """
        This is a function that updates a competition-specific match and returns a response based on the
        success or failure of the update.
        
        :param request: an HTTP request object containing information about the request being made
        :param compId: compId is a parameter that represents the ID of a competition. It is used in the
        function to identify the competition for which a specific match is being updated
        :return: If the `compId` is less than 0, a response with an error message "Invalid id" and
        status code 400 is returned. If the request data contains a key "user", a response with an error
        message "User given" and status code 400 is returned. If there is an error in updating the
        competition specific match, an empty response with status code 201 is returned
        """
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
        """
        This function deletes a competition and its associated matches based on the competition ID
        provided.
        
        :param request: The HTTP request object that contains information about the request made by the
        client
        :param compId: compId is a parameter that represents the ID of a competition that needs to be
        deleted
        :return: A response with a JSON object containing either an error message or a success message,
        along with an HTTP status code. If the compId is less than 0, an error message is returned with
        a status code of 400. Otherwise, a success message is returned with a status code of 200.
        """
        self.check_permissions(request=request)

        if compId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteCompetitionSpecificMatch(compId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    

# This is a Django REST API view class that handles CRUD operations for specific matches played by a
# club.
class specificClubMatchesDetail(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes that are instantiated.
        """
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, clubId, *args, **kwargs):
        """
        This is a Python function that retrieves a specific page number or a specific match for a given
        club ID.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :param clubId: The ID of a club for which the matches are being requested
        :return: The code returns a response object with either a page number or a list of matches
        played by a specific club, depending on the parameters passed in the request. If the request is
        invalid, it returns an error response.
        """
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
        """
        This function saves a club-specific match and returns an appropriate response.
        
        :param request: The HTTP request object containing metadata about the request, such as headers,
        method, and body
        :param clubId: The ID of the club for which the match is being saved
        :return: If the clubId is less than 0 or the "user" key is not present in the request data or its
        value is None, then a response with an error message and status code 400 (Bad Request) is
        returned. Otherwise, the data is passed to the saveClubSpecificMatch method of the
        MatchesPlayedLogic class and if there is an error, an empty response with status code
        """
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
        """
        This function updates a specific match for a club and returns an appropriate response.
        
        :param request: an HTTP request object that contains information about the request made by the
        client
        :param clubId: The ID of the club for which the match is being updated
        :return: If the clubId is less than 0, a response with an error message "Invalid id" and status
        code 400 (Bad Request) is returned. If the "user" key is present in the request data, a response
        with an error message "User given" and status code 400 is returned. If there are no errors, an
        empty response with status code 201 (Created)
        """
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
        """
        This function deletes a club and all its matches played from the database.
        
        :param request: The HTTP request object that contains information about the request made by the
        client
        :param clubId: The ID of the club that needs to be deleted
        :return: If the clubId is less than 0, a response with an error message "Invalid id" and status
        code 400 is returned. Otherwise, a response with a success message "club deleted" and status code
        200 is returned after calling the deleteClubSpecificMatch method.
        """
        self.check_permissions(request=request)

        if clubId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteClubSpecificMatch(clubId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)
    
# This is a class that handles API requests for specific matches played by a club in a competition,
# with different permissions required for different HTTP methods.
class verySpecificMatchesDetail(APIView):
    def get_permissions(self):
        """
        This function returns a list of permissions based on the HTTP request method.
        :return: A list of permission classes that are instantiated.
        """
        permissions_list = []
        if self.request.method == 'PUT' or self.request.method == 'POST': 
            permissions_list.append(IsAuthenticated)
            permissions_list.append(isRegular)
        if self.request.method == 'DELETE': 
            permissions_list.append(isModerator)
        return [permission() for permission in permissions_list]
    
    def get(self, request, compSpecId, clubSpecId, *args, **kwargs):
        """
        This function returns a response containing club and competition specific match data if the given
        IDs are valid, otherwise it returns an error response.
        
        :param request: The HTTP request object that contains information about the request made by the
        client
        :param compSpecId: The compSpecId parameter is an integer that represents the specific competition
        ID
        :param clubSpecId: The clubSpecId parameter is an identifier for a specific club in a competition
        :return: a Response object that contains the result of calling the
        `getClubAndCompetitionSpecificMatch` method of the `MatchesPlayedLogic` class with the
        `clubSpecId` and `compSpecId` parameters. If either `compSpecId` or `clubSpecId` is less than 0,
        the function returns a Response object with an error message and a status code
        """
        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(MatchesPlayedLogic.getClubAndCompetitionSpecificMatch(clubSpecId, compSpecId))
    
    def post(self, request, compSpecId, clubSpecId, *args, **kwargs):
        """
        This function saves a club and competition specific match and returns an appropriate response
        based on whether the save was successful or not.
        
        :param request: The HTTP request object containing metadata about the request, such as headers,
        method, and body
        :param compSpecId: The ID of the competition-specific match
        :param clubSpecId: The clubSpecId parameter is an identifier for a specific club in a competition
        :return: If the `compSpecId` or `clubSpecId` is less than 0, a response with an error message and
        status code 400 is returned. If there is an error in saving the match data, an empty response
        with status code 201 is returned. Otherwise, an empty response with status code 400 is returned.
        """
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.saveClubAndCompetitionSpecificMatch(data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, compSpecId, clubSpecId, *args, **kwargs):
        """
        This function updates a specific match for a club and competition and returns a response
        indicating success or failure.
        
        :param request: The HTTP request object containing metadata about the request, such as headers,
        method, and body
        :param compSpecId: The ID of a competition-specific match
        :param clubSpecId: The clubSpecId parameter is an identifier for a specific club in a competition
        :return: If the `compSpecId` or `clubSpecId` is less than 0, a response with an error message and
        status code 400 is returned. If there is an error in updating the club and competition specific
        match, an empty response with status code 201 is returned. Otherwise, an empty response with
        status code 400 is returned.
        """
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        error = MatchesPlayedLogic.updateClubAndCompetitionSpecificMatch(self, request, data, clubSpecId, compSpecId)

        if error:
            return Response({}, status=status.HTTP_201_CREATED)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, compSpecId, clubSpecId, *args, **kwargs):
        """
        This function deletes a specific club and competition match and returns a response indicating
        success or failure.
        
        :param request: The HTTP request object that contains information about the request made by the
        client
        :param compSpecId: The ID of the competition-specific match that needs to be deleted
        :param clubSpecId: clubSpecId is a unique identifier for a specific club in a competition. It is
        used in the code to identify which club's match is being deleted
        :return: A response object with a message indicating that the club has been deleted, along with a
        status code of 200 (OK).
        """
        self.check_permissions(request=request)

        if compSpecId < 0 or clubSpecId < 0:
            return Response({"error": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        
        MatchesPlayedLogic.deleteClubAndCompetitionSpecificMatch(compSpecId, clubSpecId)
        return Response({"res": "club deleted"}, status=status.HTTP_200_OK)

#LeaguesByAverage---------------------------------------------------------------------------------------------------------------------
# This is a Python class that handles GET requests for retrieving leagues by club annual budget with
# pagination.
class leaguesByAverage(APIView):
    def get(self, request, *args, **kwargs):
        """
        This is a Python function that receives HTTP GET requests and returns a response based on the
        parameters received.
        
        :param request: The HTTP request object containing information about the request made by the
        client
        :return: The code returns a response object with either a page number or a list of leagues based
        on the query parameters received in the GET request. If the query parameters are invalid, it
        returns an error response with a 400 status code.
        """
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
# This is a class that deletes multiple stadiums in bulk using the POST method and requires
# authentication and admin permission.
class bulkStadium(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        StadiumLogic.bulkDelete(request.data.get("stadiums"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
# This is a Python class that handles bulk deletion of clubs in a club management system API, with
# authentication and permission checks.
class bulkClub(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        ClubLogic.bulkDelete(request.data.get("clubs"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
# This is a class that handles bulk deletion of competitions and requires authentication and admin
# permission.
class bulkCompetition(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        CompetitionLogic.bulkDelete(request.data.get("competitions"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)
    
# This is a Python class that defines a POST API endpoint for bulk deleting matches played, with
# authentication and permission checks.
class bulkMatch(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def post(self, request, *args, **kwargs):
        self.check_permissions(request=request)
        MatchesPlayedLogic.bulkDelete(request.data.get("matches"))
        return Response({"res": "Stadiums deleted"}, status=status.HTTP_200_OK)


# This is a class that updates the pagination of a user with a given ID, but only if the pagination
# value is either 12, 20, or 40 and the user ID is not negative.
class updateUserPagination(APIView):
    permission_classes = [IsAuthenticated, isAdmin]

    def put(self, request, id, *args, **kwargs):
        """
        This function updates the pagination value for a user and returns a response indicating success
        or failure.
        
        :param request: The HTTP request object containing metadata about the request, such as headers,
        method, and data
        :param id: The id parameter is an integer representing the user's ID
        :return: a Response object with a JSON payload containing either an "error" message and a status
        code of 400 if the pagination or id values are invalid, or a "res" message and a status code of
        200 if the pagination is successfully updated.
        """
        self.check_permissions(request=request)
        if (request.data.get("pagination") != 12 and request.data.get("pagination") != 20 and request.data.get("pagination") != 40):
            Response({"error": "Wrong pagination"}, status=status.HTTP_400_BAD_REQUEST)
        if id < 0:
            Response({"error": "Invalid ip"}, status=status.HTTP_400_BAD_REQUEST)

        UserLogic.updatePagination(id, request.data)
        
        return Response({"res": "Pagination Updated"}, status=status.HTTP_200_OK)

# Call for the ai model prediction, loading and calling the already trained ai

# This is a Python class that receives data, performs AI prediction using the
# MatchesPlayedLogic.aiPredict method, and returns a response with the predicted score or an error
# message.
class aiPrediction(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        error = MatchesPlayedLogic.aiPredict(data)

        if error[0]:
            return Response({"error": "Invalid Data for prediction"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"score": error[1]}, status=status.HTTP_200_OK)
