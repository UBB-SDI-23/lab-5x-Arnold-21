from .serializers import *
from .models import *
from django.db.models import Count, Q, Avg
from django.db import connection
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from math import ceil
import random
from keras.models import load_model
from pandas import DataFrame
from numpy import argmax

# The above code is importing the `get_user_model` function from the Django authentication system and
# assigning it to the variable `User`. This function returns the user model that is currently active
# in this project.
User = get_user_model()

class UserLogic:
    @staticmethod
    def saveUser(data):
        """
        The function saves user data and sends an activation email with a confirmation code.
        
        :param data: A dictionary containing the following keys and their corresponding values:
        :return: a boolean value. It returns True if any of the validation checks fail, and False if the
        user is successfully saved to the database and an activation email is sent.
        """
        username = data["username"]
        password = data["password"]
        email = data["email"]

        if not re.search("^[a-zA-Z0-9]*$", username):
            return True
        if not re.search("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$", email):
            return True
        if not re.search("[a-z]", password) or not re.search("[A-Z]", password) or not re.search("[0-9]", password) or not re.search("[\.,\$\+]", password) or len(password) < 8:
            return True

        random.seed(timezone.now().timestamp())
        confirmationCode = str(random.randint(a=100000, b=999999))
        confirmationTime = timezone.now()

        user = User(username=username)
        user.set_password(password)
        user.email=email
        user.confirmation_code=confirmationCode
        user.confirmation_start=confirmationTime
        user.is_active=False
        user.save()

        UserDetail.objects.create(userName=user, bio=data['bio'], location=data['location'], birthday=data['day'], gender=data['gender'], marital=data['marital'])

        send_mail(
            "Account Activation",
            "Your account's activation code: " + confirmationCode,
            'noreply@leaguelizer.com',
            [user.email],
            fail_silently=False,
        )

        return False
    
    @staticmethod
    def confirmRegistration(code):
        """
        This function confirms user registration by checking the confirmation code and deleting the user
        if the confirmation time has expired.
        
        :param code: The confirmation code that the user received via email or other means to confirm
        their registration
        :return: a boolean value. It returns True if the user is not found or if the confirmation code
        has expired, and it returns False if the user is successfully confirmed and activated.
        """
        try:
            user = User.objects.get(confirmation_code=code)
        except:
            return True
        if user is None:
            return True
        
        currentTime = timezone.now()
        if (currentTime - user.confirmation_start).total_seconds()/60 >= 10:
            userDetail = UserDetail.objects.get(userName=user)
            userDetail.delete()
            user.delete()
            return True
        
        user.confirmation_code = None
        user.confirmation_start = None
        user.is_active = True
        user.save()
        return False
    
    @staticmethod
    def getUserDetail(id):
        """
        This function takes an ID as input and returns the serialized data of a user's details based on
        that ID.
        
        :param id: The parameter "id" is the identifier of a user, which is used to retrieve the user's
        details from the database
        :return: the serialized data of a UserDetail object that matches the id passed as a parameter.
        """
        return UserDetailSerializer(UserDetail.objects.get(userName__id=id)).data
    
    @staticmethod
    def getPageNumber(row):
        """
        This function calculates the number of pages needed to display a certain number of rows based on
        the total number of rows in a database table.
        
        :param row: The number of rows to be displayed per page in a paginated view
        :return: The function `getPageNumber(row)` returns the number of pages required to display all
        the data in a table with `row` number of rows per page. The calculation is based on the total
        number of rows in the table, which is obtained by executing a SQL query using the `psycopg2`
        library. The result is then divided by the `row` parameter and rounded up to the nearest integer
        """
        # return Stadium.objects.count()/row
        #Usage of specialized collumns in specifically postgres for faster query
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_user');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getPagedUsers(page, row):
        """
        This function returns a serialized list of users based on the given page and row parameters.
        
        :param page: The page number of the desired page of users
        :param row: The number of users to be returned per page
        :return: The function `getPagedUsers` returns a serialized list of `User` objects that fall
        within a certain range of IDs based on the given `page` and `row` parameters. The range is
        calculated using the formula `id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100))`. The function
        returns only the first `row` objects from
        """
        return UserSerializer(User.objects.filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteUser(name):
        """
        This function returns serialized data of up to 20 users whose usernames contain a given string.
        
        :param name: The parameter "name" is a string that represents the partial or complete username
        of a user. The function uses this parameter to filter the User objects whose username contains
        the given name (case-insensitive) and returns the serialized data of the first 20 matching users
        using the UserSerializer
        :return: The function `getAutocompleteUser` returns a serialized list of up to 20 `User` objects
        whose usernames contain the string `name`. The serialization is done using the `UserSerializer`
        class.
        """
        return UserSerializer(User.objects.filter(username__icontains=name)[:20], many = True).data
    
    @staticmethod
    def updateUserRole(id, role):
        """
        This function updates the role of a user in the database if the role is valid.
        
        :param id: The id of the user whose role needs to be updated
        :param role: The role parameter is a dictionary that contains the new role information for the
        user. It should have a key "role" with a value of either "Admin", "Moderator", or "Regular"
        :return: a boolean value. If the role provided is not one of "Admin", "Moderator", or "Regular",
        or if the serializer is not valid, the function returns True. Otherwise, it returns False.
        """
        user = User.objects.get(id=id)
        if role["role"] != "Admin" and role["role"] != "Moderator" and role["role"] != "Regular":
            return True 

        serializer = UserSerializer(instance=user, data=role, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updatePagination(id, value):
        """
        The function updates the pagination value of a user in the database.
        
        :param id: The id parameter is the unique identifier of a user in the UserDetail model. It is
        used to retrieve the user's details from the database
        :param value: The "value" parameter is expected to be a dictionary containing the new pagination
        value to be updated for the user. The dictionary should have a key "paginationValue" with the
        new value as its corresponding value
        :return: a boolean value of False.
        """
        user = UserDetail.objects.get(userName__id=id)
        user.paginationValue = value.get("paginationValue")
        user.save()
        
        return False

class StadiumLogic:
    @staticmethod
    def getPagedStadiums(page, row):
        """
        This function returns serialized data of stadiums with the number of clubs associated with each
        stadium, filtered by a specific page and row.
        
        :param page: The page number of the paginated results to retrieve
        :param row: The `row` parameter is the number of stadiums to be returned per page. It determines
        the size of each page of results
        :return: The function `getPagedStadiums` is returning a serialized queryset of `Stadium` objects
        with an additional annotation of `NumberOfClubs` which counts the number of related `Club`
        objects for each stadium. The queryset is filtered to include only stadiums with an `id` greater
        than `row*(page-1)` and less than `row*(page+100)`, and is
        """
        return StadiumSerializer(Stadium.objects.annotate(NumberOfClubs=Count("stadium")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteStadium(name):
        """
        This function returns a list of serialized stadium objects that match a given name using
        PostgreSQL's full-text search.
        
        :param name: The parameter "name" is a string that represents the search query for a stadium
        name. It is used to filter the Stadium objects based on the name that contains the search query.
        The function returns a serialized data of the Stadium objects that match the search query,
        limited to 20 results
        :return: The function `getAutocompleteStadium` returns a serialized data of up to 20 Stadium
        objects whose names match the search query provided as an argument. The search is performed
        using PostgreSQL's full-text search functionality.
        """
        # return StadiumSerializer(Stadium.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_stadium" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getPageNumber(row):
        """
        This function calculates the total number of pages needed to display all the stadiums based on
        the given number of rows per page.
        
        :param row: The number of rows to be displayed per page in a paginated view
        :return: The function `getPageNumber(row)` returns the number of pages required to display all
        the Stadium objects in the database, given the number of rows to display per page. The
        calculation is based on the total number of rows in the `lab1_api_stadium` table, which is
        obtained using a PostgreSQL query. The result is rounded up to the nearest integer using the
        `ceil()` function.
        """
        # return Stadium.objects.count()/row
        #Usage of specialized collumns in specifically postgres for faster query
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_stadium');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def bulkDelete(data):
        """
        This function deletes multiple objects from the Stadium model in Django based on a list of IDs
        provided in the data parameter.
        
        :param data: a list of dictionaries, where each dictionary represents a Stadium object and
        contains the "id" key with the value of the Stadium's ID
        """
        for item in data:
            try:
                obj = Stadium.objects.get(id=item.get("id"))
                obj.delete()
            except:
                continue
    

class ClubLogic:
    @staticmethod
    def getPageNumber(row):
        """
        This function calculates the total number of pages needed to display all the rows in a database
        table based on the given number of rows per page.
        
        :param row: The parameter "row" is the number of rows to be displayed per page in a pagination
        system
        :return: The function `getPageNumber(row)` returns the number of pages required to display all
        the rows in a table named `lab1_api_club` with a given number of rows per page (`row`). The
        calculation is based on the total number of rows in the table, which is obtained using a
        PostgreSQL query that estimates the number of tuples in the table. The result is rounded up to
        the nearest integer
        """
        # return Club.objects.count()/row
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_club');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getBudgetFilteredPageNumber(budget, row):
        """
        This function calculates the number of pages needed to display all the clubs whose annual budget
        is greater than a given value, based on the number of rows per page.
        
        :param budget: The minimum annual budget that a club must have in order to be included in the
        filtered page count
        :param row: The number of rows to display per page in a paginated view
        :return: the page number required to display all the Club objects whose annual budget is greater
        than the given budget, based on the given number of rows per page. The page number is calculated
        by dividing the total count of such Club objects by the given number of rows per page and then
        rounding up to the nearest integer using the ceil() function.
        """
        return ceil(Club.objects.filter(annualBudget__gt=budget).count()/row)
    
    @staticmethod
    def getPagedClubs(page, row):
        """
        This function returns a serialized list of clubs with a specified number of rows and page
        number, filtered by their ID and annotated with the number of matches played.
        
        :param page: The page parameter is an integer that represents the page number of the clubs to be
        retrieved
        :param row: The number of clubs to return per page
        :return: The function `getPagedClubs` is returning a serialized data of clubs with additional
        field `matchesPlayed` that is annotated using `Count` function. The clubs are filtered based on
        their `id` using `Q` objects and sliced based on the `page` and `row` parameters. The serialized
        data is returned as a list of dictionaries.
        """
        return clubSerializer(Club.objects.annotate(matchesPlayed=Count("related_club1")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteClub(name):
        """
        The function returns a list of serialized stadium objects that match a given search query for
        club names.
        
        :param name: The parameter "name" is a string that represents the name of the club that the user
        is searching for. It is used to filter the results and return only the clubs that match the
        search query
        :return: The function `getAutocompleteClub` is returning data in the form of serialized Stadium
        objects. The data is obtained by querying the `Stadium` model in the database using a full-text
        search on the `name` field, and limiting the results to 20.
        """
        # return clubSerializer(Club.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_club" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getStadiumCapacityStatisticsPageNumber(row):
        """
        This function calculates the number of pages needed to display stadium capacity statistics based
        on the number of rows per page and the total number of clubs in a PostgreSQL database.
        
        :param row: The number of rows to be displayed on each page of the stadium capacity statistics
        :return: the number of pages needed to display the stadium capacity statistics based on the
        given number of rows per page. The calculation is based on the total number of clubs in the
        database, which is obtained using a specialized column in PostgreSQL for faster query. The
        result is rounded up to the nearest integer using the ceil() function.
        """
        # return Club.objects.count()/row
        #Usage of specialized collumns in specifically postgres for faster query
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_club');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)

    @staticmethod
    def getStadiumCapacityStatistics(page, row):
        """
        This function returns statistics on the stadium capacity of clubs, sorted by capacity and
        paginated.
        
        :param page: The page number of the results to retrieve
        :param row: The number of items (clubs) to be displayed per page
        :return: The function `getStadiumCapacityStatistics` is returning a serialized data of `Club`
        objects with an additional field `stadiumCapacity` which is the average capacity of the stadium
        associated with each club. The data is ordered by `stadiumCapacity` and paginated based on the
        `page` and `row` parameters. The returned data is in JSON format.
        """
        return simpleClubSerializer(Club.objects.annotate(stadiumCapacity=Avg('stadium__capacity'))\
                                        .order_by("stadiumCapacity")[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getSingleClubWithLeague(id):
        """
        This function returns serialized data of a single club object with a given ID.
        
        :param id: The parameter "id" is an integer value that represents the unique identifier of a
        Club object in the database. The function "getSingleClubWithLeague" takes this id as input and
        returns the serialized data of the corresponding Club object along with its associated League
        object
        :return: The function `getSingleClubWithLeague` is returning the serialized data of a single
        club object with the given `id` parameter, which includes information about the club's
        associated league.
        """
        return clubSerializer(Club.objects.get(id=id)).data
    
    @staticmethod
    def filterClubByAnnualBudget(budget, page, row):
        """
        This function filters clubs based on their annual budget and returns a serialized data of the
        filtered clubs with pagination.
        
        :param budget: The minimum annual budget that a club must have in order to be included in the
        filtered results
        :param page: The page parameter is used to specify which page of results to return. It is an
        integer value that represents the page number
        :param row: The number of rows to return in the filtered queryset
        :return: The function `filterClubByAnnualBudget` returns a serialized data of clubs whose annual
        budget is greater than the given `budget` parameter, filtered by the `id` of the club within a
        certain range based on the `page` and `row` parameters. The serialized data is returned as a
        list of dictionaries.
        """
        return clubSerializer(Club.objects.filter(annualBudget__gt=budget).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many=True).data
    
    @staticmethod
    def saveClubWithLeague(club):
        """
        This function saves a club with its associated league using two serializers.
        
        :param club: The "club" parameter is a dictionary object that contains information about a
        sports club, such as its name, location, and the league it belongs to
        :return: a boolean value. It returns False if both the leagueSerializer and clubSerializer are
        valid and saved successfully, and it returns True if either of them is invalid and not saved.
        """
        league = club.get("league")
        league['user'] = club.get("user")
        leagueSerializer = simpleCompetitionSerializer(data=league)
        obj = None
        if leagueSerializer.is_valid():
            obj = leagueSerializer.save()
        else:
            return True

        club["league"] = obj.id
        clubSerializer = simpleClubSerializer(data=club)
        if clubSerializer.is_valid():
            clubSerializer.save()
        else:
            return True
        
        return False

    @staticmethod
    def saveClubWithCompetitions(club):
        """
        This function saves a club and its competitions, along with the matches played in those
        competitions, using serializers in Python.
        
        :param club: The "club" parameter is a dictionary object that represents a sports club. It
        contains information such as the club's name, location, and a list of competitions that the club
        participates in
        :return: a boolean value. It returns False if all the data is successfully saved, and True if
        there is an error in the data and it cannot be saved.
        """
        comps = club.get("comps")

        clubSerializer = simpleClubSerializer(data=club)
        obj = None
        if clubSerializer.is_valid():
            obj = clubSerializer.save()
        else: return True
        clubId = obj.id

        for comp in comps:
            comp['user'] = obj.user.id
            compSerializer = simpleCompetitionSerializer(data=comp)
            obj = None
            if compSerializer.is_valid():
                obj = compSerializer.save()
            else: return True
            compId = obj.id

            matchDetails = comp["matchDetails"]
            matchDetails["competition"] = compId
            matchDetails["club1"] = clubId
            matchDetails["user"] = obj.user.id
            
            matchSerializer = simpleMatchesPlayedSerializer(data=matchDetails)
            if matchSerializer.is_valid():
                matchSerializer.save()
            else: return True
        
        return False
    
    @staticmethod
    def bulkDelete(data):
        """
        The function deletes objects from the Club model based on their IDs in a given list of data.
        
        :param data: a list of dictionaries, where each dictionary represents a Club object and contains
        an "id" key with the value of the Club's unique identifier
        """
        for item in data:
            try:
                obj = Club.objects.get(id=item.get("id"))
                obj.delete()
            except:
                continue
        
class CompetitionLogic:
    @staticmethod
    def getPageNumber(row):
        """
        This function calculates the total number of pages needed to display a certain number of rows in
        a database table.
        
        :param row: The parameter "row" is the number of rows to be displayed per page in a paginated
        view of a list of competitions. The function calculates the total number of pages required to
        display all the competitions based on this parameter
        :return: The function `getPageNumber(row)` is returning the number of pages required to display
        all the competitions in the database, given the number of rows to display per page (`row`). The
        calculation is based on the total number of competitions in the database, which is obtained
        using a specialized column in PostgreSQL (`reltuples::bigint`), and then dividing it by the
        number of rows per page and rounding up
        """
        # return Competition.objects.count()/row
        #Usage of specialized collumns in specifically postgres for faster query
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_competition');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getPagedComps(page, row):
        """
        This function returns a serialized list of competitions with a specified number of rows and page
        number.
        
        :param page: The page number of the paginated results to retrieve
        :param row: The number of competitions to return per page
        :return: The function `getPagedComps` is returning a serialized data of competitions with a
        limit of `row` number of competitions per page and starting from the `row*(page-1)`th
        competition. The data is filtered using `Q` objects to get competitions with an `id` greater
        than `row*(page-1)` and less than `row*(page+100)`. The
        """
        return competitionSerializer(Competition.objects.annotate(RealNumberOfTeams=Count("league")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteComps(name):
        """
        The function returns a list of serialized stadium objects that match a given search query.
        
        :param name: The parameter "name" is a string that represents the search query for competitions.
        It is used to filter the competitions based on their name using the "icontains" lookup in the
        Competition model. It is also used to perform a full-text search on the "search" field in the
        Stadium model using the
        :return: The function `getAutocompleteComps` is returning a serialized data of Stadium objects
        that match the search query specified by the `name` parameter. The search is performed using
        PostgreSQL's full-text search functionality. The returned data is limited to 20 objects.
        """
        # return competitionSerializer(Competition.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_competition" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getsingleCompetitionWithLeagueClub(id):
        """
        This function returns serialized data of a single competition object with a given ID, including
        its league and club information.
        
        :param id: The parameter "id" is a unique identifier for a competition in the database. The
        function "getsingleCompetitionWithLeagueClub" takes this id as input and returns the serialized
        data of the competition object with the given id, including information about the league and
        club associated with the competition
        :return: the serialized data of a single competition object with the given id, which includes
        information about the competition's league and club.
        """
        return competitionSerializer(Competition.objects.get(id=id)).data
    
    @staticmethod
    def getLeaguesByClubAnnualBudgetPageNumber(row):
        """
        This function returns the number of pages needed to display a list of leagues sorted by their
        average annual budget, based on a given number of rows per page.
        
        :param row: The number of rows to display per page in a paginated view. This function is
        calculating the total number of pages needed to display all the leagues that have an average
        annual budget, based on the given number of rows per page
        :return: This function returns the number of pages required to display a list of leagues based
        on the annual budget of their associated clubs, given the number of rows to display per page.
        The function calculates the total number of leagues that meet the criteria of being a "League"
        competition type and having a non-null average annual budget for their associated clubs. It then
        divides this count by the number of rows per page and
        """
        return ceil(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget").count()/row)
    
    @staticmethod
    def getLeaguesByClubAnnualBudget(page, row):
        """
        This function returns a serialized list of leagues filtered by competition type and ordered by
        average annual budget, with pagination.
        
        :param page: The page number of the results to retrieve
        :param row: The number of results to return per page
        :return: a serialized list of league competitions filtered by competition type "League", sorted
        by the average annual budget of the league, and paginated based on the given page and row
        parameters. The leagues with no annual budget are excluded from the list.
        """
        return simpleCompetitionSerializer(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget")[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def saveCompetitionWithLeagueClubs(comp):
        """
        This function saves a competition and its associated clubs with the league ID and user ID.
        
        :param comp: The "comp" parameter is likely a dictionary object containing information about a
        competition, including its name, start and end dates, and a list of clubs participating in the
        competition
        :return: a boolean value - True or False. If there is an error in the data validation or saving
        process, the function returns True. Otherwise, it returns False.
        """
        clubs = comp.get('clubs')

        compSerializer = simpleCompetitionSerializer(data=comp)
        obj = None
        if compSerializer.is_valid():
            obj = compSerializer.save()
        else: return True
        
        newCompId = Competition.objects.last().id

        for club in clubs:
            club['league'] = newCompId
            club['user'] = obj.user.id
            clubSerializer = simpleClubSerializer(data=club)
            if clubSerializer.is_valid():
                clubSerializer.save()
            else: return True

        return False
    
    @staticmethod
    def saveCompetitionWithClubMatcehs(comp):
        """
        This function saves a competition with its associated clubs and matches played.
        
        :param comp: The "comp" parameter is a dictionary object representing a competition, which
        includes information such as the competition name, start and end dates, and a list of clubs
        participating in the competition
        :return: a boolean value. It returns True if there is an error in either the competition
        serializer, club serializer, or match serializer. It returns False if all the serializers are
        valid and the matches played have been saved successfully.
        """
        clubs = comp.get("clubs")

        compSerializer = simpleCompetitionSerializer(data=comp)
        obj = None
        if compSerializer.is_valid():
            obj = compSerializer.save()
        else: return True
        compId = obj.id

        for club in clubs:
            club['user'] = obj.user.id
            clubSerializer = simpleClubSerializer(data=club)
            obj = None
            if clubSerializer.is_valid():
                obj = clubSerializer.save()
            clubId = obj.id

            matchDetails = club["matchDetails"]
            matchDetails["competition"] = compId
            matchDetails["club1"] = clubId
            matchDetails["user"] = obj.user.id
            
            matchSerializer = simpleMatchesPlayedSerializer(data=matchDetails)
            if matchSerializer.is_valid():
                matchSerializer.save()
            else: return True

        return False
    
    @staticmethod
    def updateClubLeagues(view, request, clubs, compID):
        """
        This function updates the league of a list of clubs to a specified competition.
        
        :param view: This parameter is likely a reference to the Django view that is calling this
        function. It is used to check the permissions of the user making the request
        :param request: The HTTP request object that contains information about the current request,
        such as the user making the request and any data submitted with the request
        :param clubs: A dictionary containing a list of club IDs under the key "clubs"
        :param compID: The ID of the competition that the clubs will be updated to
        :return: a boolean value. If the currentComp is None, it returns True. If the currentClub is
        None, it also returns True. Otherwise, it returns False.
        """
        clubs = clubs.get("clubs")

        currentComp = Competition.objects.filter(id=compID).first()
        if currentComp is None:
            return True
        
        view.check_object_permissions(request, currentComp)

        for clubID in clubs:
            currentClub = Club.objects.filter(id=clubID).first()
            if currentClub is None:
                return True
            
            currentClub.league = currentComp
            currentClub.save()
            
        return False
            
    @staticmethod
    def bulkDelete(data):
        """
        This function deletes objects from the Competition model based on their IDs in a given list of
        data.
        
        :param data: a list of dictionaries, where each dictionary contains an "id" key with the value
        being the ID of a Competition object to be deleted
        """
        for item in data:
            try:
                obj = Competition.objects.get(id=item.get("id"))
                obj.delete
            except:
                continue

    
class MatchesPlayedLogic:
    @staticmethod
    def getPageNumber(row):
        """
        This function calculates the total number of pages needed to display a certain number of rows
        based on the total number of matches played.
        
        :param row: The parameter "row" is the number of rows to be displayed per page in a pagination
        system. It is used to calculate the total number of pages needed to display all the data
        :return: The function `getPageNumber(row)` is returning the total number of pages required to
        display all the data in a table with `row` number of rows per page. It calculates this by
        dividing the total number of rows in the table by the number of rows per page and then rounding
        up to the nearest integer using the `ceil()` function. The total number of rows in the table is
        obtained using a
        """
        # return MatchesPlayed.objects.count()/row
        #Usage of specialized collumns in specifically postgres for faster query
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_matchesplayed');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getPagedMatches(page, row):
        """
        This function returns serialized data of matches played within a specified page and row, along
        with the average annual budget of the league the competition belongs to.
        
        :param page: The page number of the results to retrieve
        :param row: The number of rows to return in each page of results
        :return: The function `getPagedMatches` is returning a serialized data of matches played with
        additional information of average annual budget of the league to which the club belongs. The
        matches are filtered based on the page number and number of rows per page.
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.raw('select *, (select AVG("annualBudget") from lab1_api_club where "league_id" = "competition_id") as AvgLeagueBudget from lab1_api_matchesplayed where (id >= %s) and (id <= %s) limit %s', ((row*(page - 1)), (row*(page + 100)), row,)), many=True).data
    
    @staticmethod
    def getSingleMatchPlayedWithDetail(id):
        """
        This function returns the serialized data of a single match played with the given ID.
        
        :param id: The parameter "id" is an integer value that represents the unique identifier of a
        specific match played. This function retrieves the details of the match played with the given id
        by querying the MatchesPlayed model and serializing the data using the matchesPlayedSerializer
        :return: the serialized data of a single match played with the given ID.
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.get(id=id)).data
    
    @staticmethod
    def getAutocompleteDates(date):
        """
        This function returns the serialized data of the first 20 matches played whose date matches a
        given regular expression.
        
        :param date: The input parameter "date" is a string that represents a regular expression used to
        filter the MatchesPlayed objects based on their date field. The function returns the serialized
        data of the first 20 MatchesPlayed objects that match the given regular expression
        :return: The function `getAutocompleteDates` is returning the serialized data of the first 20
        matches played whose date matches the regular expression `date`. The serialized data is obtained
        using the `matchesPlayedSerializer` and the `many=True` parameter indicates that multiple objects
        are being serialized.
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(date__regex=date)[:20], many = True).data
    
    @staticmethod
    def getCompetitionSpecificMatch(id, page, row):
        """
        This function returns serialized data of matches played in a specific competition based on the
        given page and row parameters.
        
        :param id: The ID of the competition for which we want to retrieve the matches played
        :param page: The page parameter is used to specify which page of results to retrieve. It is
        typically used in conjunction with the row parameter to implement pagination. For example, if
        there are 100 results and the row parameter is set to 10, then there would be 10 pages of
        results. The page parameter
        :param row: The number of matches to be returned per page
        :return: a serialized data of matches played in a specific competition, filtered by the
        competition ID. The number of matches returned is determined by the page and row parameters,
        which are used to slice the queryset. The serialized data is returned as a list of dictionaries,
        with each dictionary representing a match played.
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(competition=id)[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getCompetitionSpecificPageNumber(id, row):
        """
        This function calculates the number of pages needed to display all matches played in a specific
        competition based on the number of matches to display per row.
        
        :param id: The id parameter is the identifier of a competition. It is used to filter the
        MatchesPlayed objects to only include matches that belong to that specific competition
        :param row: The number of rows to display on each page of the competition-specific page
        :return: the page number required to display all the matches played in a specific competition,
        given the competition ID and the number of rows to display per page. The page number is
        calculated by dividing the total number of matches played in the competition by the number of
        rows per page and then rounding up to the nearest integer using the ceil() function.
        """
        return ceil(MatchesPlayed.objects.filter(competition=id).count()/row)
    
    @staticmethod
    def saveCompetitionSpecificMatch(data, id):
        """
        This function saves a competition-specific match using the provided data and ID.
        
        :param data: A dictionary containing the data for a specific match played in a competition
        :param id: The id parameter is the identifier of a competition to which a match is being saved
        :return: a boolean value. If the serializer is not valid, it returns True. Otherwise, it returns
        False.
        """
        data["competition"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True

        return False
    
    @staticmethod
    def updateCompetitionSpecificMatch(view, request, data):
        """
        This function updates a specific match in a competition using data provided in a serializer.
        
        :param view: This parameter is likely a Django view object that handles the HTTP request and
        response for this function
        :param request: The HTTP request object that contains information about the current request being
        made by the client, such as the HTTP method, headers, and any data being sent in the request body
        :param data: a dictionary containing the updated data for a specific match in a competition
        :return: a boolean value. If the serializer is not valid, it returns True. Otherwise, it returns
        False.
        """
        mat = MatchesPlayed.objects.get(id=data["id"])
        view.check_object_permissions(request, mat)
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteCompetitionSpecificMatch(ID):
        """
        This function deletes a specific match from the MatchesPlayed model based on its ID.
        
        :param ID: The ID parameter is the unique identifier of the match that needs to be deleted from the
        MatchesPlayed database table
        """
        mat = MatchesPlayed.objects.get(id=ID)
        mat.delete()
    
    @staticmethod
    def getClubSpecificMatch(id, page, row):
        """
        This function returns serialized data of matches played by a specific club based on the given
        parameters.
        
        :param id: The id parameter is the identifier of a specific club for which we want to retrieve the
        matches played
        :param page: The page parameter is used to specify which page of results to retrieve. It is
        typically used in conjunction with the row parameter to implement pagination. For example, if there
        are 100 results and the row parameter is set to 10, then there would be 10 pages of results, and the
        page
        :param row: The "row" parameter in the above function is used to determine the number of matches to
        be returned per page. It is multiplied by the page number to determine the range of matches to be
        returned from the database. For example, if row is 10 and page is 2, the function will
        :return: This function returns serialized data of matches played by a specific club, filtered by the
        club's ID. The data is paginated based on the given page and row parameters.
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(club1=id)[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getClubSpecificPageNumber(id, row):
        """
        This function calculates the number of pages needed to display all matches played by a specific club
        based on the number of matches per row.
        
        :param id: The id parameter is the unique identifier of a club. It is used to filter the
        MatchesPlayed objects and count the number of matches played by the club
        :param row: The number of rows to display on each page of the table
        :return: The function `getClubSpecificPageNumber` is returning the page number required to display
        all the matches played by a specific club (`id`) based on the number of rows (`row`) to be displayed
        per page. The page number is calculated by dividing the total number of matches played by the club
        (`MatchesPlayed.objects.filter(club1=id).count()`) by the number of rows per page and
        """
        return ceil(MatchesPlayed.objects.filter(club1=id).count()/row)
    
    @staticmethod
    def saveClubSpecificMatch(data, id):
        """
        This function saves a match with club-specific data using a serializer in Python.
        
        :param data: a dictionary containing the data for a specific match played by a club
        :param id: The id parameter is the identifier of a club that is being used to save a specific match
        :return: a boolean value. If the serializer is valid and the data is saved successfully, it returns
        False. If the serializer is not valid, it returns True.
        """
        data["club1"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updateClubSpecificMatch(view, request, data, clubId):
        """
        This function updates a specific match played by a club in a Django web application.
        
        :param view: This parameter is likely a reference to the Django view function or class that is
        calling the `updateClubSpecificMatch` function
        :param request: The HTTP request object that contains information about the current request being
        made by the client
        :param data: a dictionary containing the updated data for a specific match played
        :param clubId: The ID of the club that is being updated in the match
        :return: a boolean value. If the serializer is not valid, it returns True. Otherwise, it returns
        False.
        """
        mat = MatchesPlayed.objects.get(id=data["id"])
        view.check_object_permissions(request, mat)
        data["club1"] = clubId
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteClubSpecificMatch(id):
        """
        This function deletes a specific match played by a club.
        
        :param id: The parameter "id" is a unique identifier for a specific match that needs to be deleted
        from the MatchesPlayed database table. The function retrieves the match object using this id and
        then deletes it from the database
        """
        mat = MatchesPlayed.objects.get(id=id)
        mat.delete()
    
    @staticmethod
    def getClubAndCompetitionSpecificMatch(clubId, compId):
        """
        This function returns serialized data of matches played by a specific club in a specific
        competition.
        
        :param clubId: The ID of the competition for which you want to retrieve the matches played by a
        specific club
        :param compId: The parameter `compId` is likely an identifier for a specific competition. It is used
        in the function to filter the `MatchesPlayed` queryset to only include matches where the `club1`
        field matches the `compId` parameter and the `competition` field matches the `clubId` parameter
        :return: serialized data of matches played by a specific club (compId) in a specific competition
        (clubId).
        """
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(competition=clubId).filter(club1=compId), many=True).data
    
    @staticmethod
    def saveClubAndCompetitionSpecificMatch(data, clubId, compId):
        """
        This function saves a match with club and competition specific data using a serializer.
        
        :param data: a dictionary containing information about a match played, such as the date,
        location, and scores of the two teams involved
        :param clubId: The ID of the club that played the match
        :param compId: The ID of the competition for which the match is being saved
        :return: a boolean value. If the serializer is valid and the data is saved successfully, it
        returns False. If the serializer is not valid, it returns True.
        """
        data["club1"] = clubId
        data["competition"] = compId
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updateClubAndCompetitionSpecificMatch(view, request, data, clubId, compId):
        """
        This function updates a specific match played by a club in a competition with the provided data.
        
        :param view: This parameter is likely a reference to the Django view function or class that is
        calling the `updateClubAndCompetitionSpecificMatch` function
        :param request: The HTTP request object that contains information about the current request being
        made by the client
        :param data: A dictionary containing the updated data for the match
        :param clubId: The ID of the club for which the match is being updated
        :param compId: The ID of the competition for which the match is being updated
        :return: a boolean value. If the serializer is not valid, it returns True. Otherwise, it returns
        False.
        """
        mat = MatchesPlayed.objects.get(Q(club1=clubId) & Q(competition=compId))
        view.check_object_permissions(request, mat)
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteClubAndCompetitionSpecificMatch(clubId, compId):
        """
        This function deletes a specific match played by a club in a particular competition.
        
        :param clubId: The ID of the club whose match is to be deleted
        :param compId: The compId parameter is the ID of the competition for which the match needs to be
        deleted
        """
        mat = MatchesPlayed.objects.get(Q(club1=clubId) & Q(competition=compId))
        mat.delete()

    @staticmethod
    def bulkDelete(data):
        """
        The function bulkDelete deletes objects from the MatchesPlayed model based on the provided data.
        
        :param data: The parameter "data" is a list of dictionaries, where each dictionary represents a
        MatchesPlayed object and contains the values for its attributes. The "bulkDelete" function
        iterates over this list and deletes the corresponding MatchesPlayed object from the database
        using its unique identifier "id". If an object with the
        """
        for item in data:
            try:
                obj = MatchesPlayed.objects.get(id=item.get("id"))
                obj.delete()
            except:
                continue

    @staticmethod
    def aiPredict(data):
        """
        The function takes in data about a football match and uses a pre-trained model to predict the
        score of the match.
        
        :param data: The input data for the prediction model, which includes the IDs of two football
        clubs, the ID of the competition, the ID of the stadium, and the round of play
        :return: A tuple containing a boolean value (False) and a string representing the predicted score
        of a match.
        """
        predictData = DataFrame({
            'club1_id': [int(data.get("club1"))],
            'club2_id': [int(data.get("club2"))],
            'competition_id': [int(data.get("competition"))],
            'stadium_id': [int(data.get("stadium"))],
            'roundOfPlay_F': [1 if data.get("roundOfPlay") == 'F' else 0],
            'roundOfPlay_G': [1 if data.get("roundOfPlay") == 'G' else 0],
            'roundOfPlay_L': [1 if data.get("roundOfPlay") == 'L' else 0],
            'roundOfPlay_QF': [1 if data.get("roundOfPlay") == 'QF' else 0],
            'roundOfPlay_R16': [1 if data.get("roundOfPlay") == 'R16' else 0],
            'roundOfPlay_SM': [1 if data.get("roundOfPlay") == 'SM' else 0]
        })
        unique =  ['1-1', '6-1', '7-7', '2-8', '2-6', '4-6', '4-1', '8-3', '6-8', '4-3', '1-4', '4-4', '7-5', '2-7', '1-5', '1-3', '5-1', '2-3', '5-0', '3-1', '0-1', '2-1', '8-1', '0-0', '8-2', '4-7', '1-7', '1-6', '3-8', '6-7', '0-3', '7-6', '3-3', '1-8', '0-8', '5-6', '3-5', '2-0', '5-3', '5-2', '8-7', '3-7', '6-5', '7-3', '4-0', '4-2', '0-7', '3-0', '1-2', '6-6', '1-0', '6-2', '5-7', '0-4', '4-5', '7-1', '0-5', '6-3', '7-8', '7-4', '0-6', '7-0', '8-4', '6-0', '8-5', '2-2', '7-2', '8-6', '2-4', '2-5', '5-8', '6-4', '8-8', '4-8', '0-2', '8-0', '5-5', '3-2', '3-4', '3-6', '5-4']
        model = load_model("./lab1_api/matchModel.h5")
        result = model.predict(predictData)
        resultScore = unique[argmax(result)]

        return (False, resultScore)