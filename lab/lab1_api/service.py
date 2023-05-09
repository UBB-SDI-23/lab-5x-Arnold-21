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
import hashlib

User = get_user_model()

class UserLogic:
    @staticmethod
    def saveUser(data):
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
        return UserDetailSerializer(UserDetail.objects.get(userName__id=id)).data

class StadiumLogic:
    @staticmethod
    def getPagedStadiums(page, row):
        return StadiumSerializer(Stadium.objects.annotate(NumberOfClubs=Count("stadium")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteStadium(name):
        # return StadiumSerializer(Stadium.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_stadium" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getPageNumber(row):
        return Stadium.objects.count()/row
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_stadium');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
        

class ClubLogic:
    @staticmethod
    def getPageNumber(row):
        return Club.objects.count()/row
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_club');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getBudgetFilteredPageNumber(budget, row):
        return ceil(Club.objects.filter(annualBudget__gt=budget).count()/row)
    
    @staticmethod
    def getPagedClubs(page, row):
        return clubSerializer(Club.objects.annotate(matchesPlayed=Count("related_club1")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteClub(name):
        # return clubSerializer(Club.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_club" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getStadiumCapacityStatisticsPageNumber(row):
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_club');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)

    @staticmethod
    def getStadiumCapacityStatistics(page, row):
        return simpleClubSerializer(Club.objects.annotate(stadiumCapacity=Avg('stadium__capacity'))\
                                        .order_by("stadiumCapacity")[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getSingleClubWithLeague(id):
        return clubSerializer(Club.objects.get(id=id)).data
    
    @staticmethod
    def filterClubByAnnualBudget(budget, page, row):
        return clubSerializer(Club.objects.filter(annualBudget__gt=budget).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many=True).data
    
    @staticmethod
    def saveClubWithLeague(club):
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
        
class CompetitionLogic:
    @staticmethod
    def getPageNumber(row):
        return Competition.objects.count()/row
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_competition');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getPagedComps(page, row):
        return competitionSerializer(Competition.objects.annotate(RealNumberOfTeams=Count("league")).filter(Q(id__gt=row*(page - 1)) & Q(id__lt=row*(page + 100)))[:row], many = True).data
    
    @staticmethod
    def getAutocompleteComps(name):
        # return competitionSerializer(Competition.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw('select * from "lab1_api_competition" where search @@ plainto_tsquery(%s) limit 20;', (name,))[:20], many = True).data
    
    @staticmethod
    def getsingleCompetitionWithLeagueClub(id):
        return competitionSerializer(Competition.objects.get(id=id)).data
    
    @staticmethod
    def getLeaguesByClubAnnualBudgetPageNumber(row):
        return ceil(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget").count()/row)
    
    @staticmethod
    def getLeaguesByClubAnnualBudget(page, row):
        return simpleCompetitionSerializer(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget")[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def saveCompetitionWithLeagueClubs(comp):
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
            print(club)
            clubSerializer = simpleClubSerializer(data=club)
            if clubSerializer.is_valid():
                clubSerializer.save()
            else: return True

        return False
    
    @staticmethod
    def saveCompetitionWithClubMatcehs(comp):
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
    def updateClubLeagues(clubs, compID):
        clubs = clubs.get("clubs")

        currentComp = Competition.objects.filter(id=compID).first()
        if currentComp is None:
            return True

        for clubID in clubs:
            currentClub = Club.objects.filter(id=clubID).first()
            if currentClub is None:
                return True
            
            currentClub.league = currentComp
            currentClub.save()
            
        return False
            

    
class MatchesPlayedLogic:
    @staticmethod
    def getPageNumber(row):
        return MatchesPlayed.objects.count()/row
        cursor = connection.cursor()
        cursor.execute("select reltuples::bigint as estimate from pg_class where oid = to_regclass('lab1_api_matchesplayed');")
        fetchedRow = cursor.fetchone()
        return ceil(fetchedRow[0]/row)
    
    @staticmethod
    def getPagedMatches(page, row):
        return matchesPlayedSerializer(MatchesPlayed.objects.raw('select *, (select AVG("annualBudget") from lab1_api_club where "league_id" = "competition_id") as AvgLeagueBudget from lab1_api_matchesplayed where (id >= %s) and (id <= %s) limit %s', ((row*(page - 1)), (row*(page + 100)), row,)), many=True).data
    
    @staticmethod
    def getSingleMatchPlayedWithDetail(id):
        return matchesPlayedSerializer(MatchesPlayed.objects.get(id=id)).data
    
    @staticmethod
    def getAutocompleteDates(date):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(date__regex=date)[:20], many = True).data
    
    @staticmethod
    def getCompetitionSpecificMatch(id, page, row):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(competition=id)[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getCompetitionSpecificPageNumber(id, row):
        return ceil(MatchesPlayed.objects.filter(competition=id).count()/row)
    
    @staticmethod
    def saveCompetitionSpecificMatch(data, id):
        data["competition"] = id
        print(data)
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True

        return False
    
    @staticmethod
    def updateCompetitionSpecificMatch(data):
        mat = MatchesPlayed.objects.get(id=data["id"])
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteCompetitionSpecificMatch(ID):
        mat = MatchesPlayed.objects.get(id=ID)
        mat.delete()
    
    @staticmethod
    def getClubSpecificMatch(id, page, row):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(club1=id)[row*(page - 1):row*page], many=True).data
    
    @staticmethod
    def getClubSpecificPageNumber(id, row):
        return ceil(MatchesPlayed.objects.filter(club1=id).count()/row)
    
    @staticmethod
    def saveClubSpecificMatch(data, id):
        data["club1"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updateClubSpecificMatch(data, clubId):
        mat = MatchesPlayed.objects.get(id=data["id"])
        data["club1"] = clubId
        print(data)
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteClubSpecificMatch(id):
        mat = MatchesPlayed.objects.get(id=id)
        mat.delete()
    
    @staticmethod
    def getClubAndCompetitionSpecificMatch(clubId, compId):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(competition=clubId).filter(club1=compId), many=True).data
    
    @staticmethod
    def saveClubAndCompetitionSpecificMatch(data, clubId, compId):
        data["club1"] = clubId
        data["competition"] = compId
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updateClubAndCompetitionSpecificMatch(data, clubId, compId):
        mat = MatchesPlayed.objects.get(Q(club1=clubId) & Q(competition=compId))
        serializer = simpleMatchesPlayedSerializer(instance=mat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def deleteClubAndCompetitionSpecificMatch(clubId, compId):
        mat = MatchesPlayed.objects.get(Q(club1=clubId) & Q(competition=compId))
        mat.delete()