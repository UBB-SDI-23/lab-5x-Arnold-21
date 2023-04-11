from .serializers import *
from .models import *
from django.db.models import F, Q, Avg
from math import ceil

class StadiumLogic:
    @staticmethod
    def getPagedStadiums(page):
        return StadiumSerializer(Stadium.objects.all()[100*(page - 1):100*page], many = True).data
    
    @staticmethod
    def getAutocompleteStadium(name):
        # return StadiumSerializer(Stadium.objects.filter(name__icontains=name)[:20], many = True).data
        return StadiumSerializer(Stadium.objects.raw(f"Select * from lab1_api_stadium where to_tsvector(name) @@ to_tsquery({name})")[:20], many=True).data
    
    @staticmethod
    def getPageNumber():
        return ceil(Stadium.objects.all().count()/100)
        

class ClubLogic:
    @staticmethod
    def getStadiumCapacityQuery():
        return Club.objects.annotate(stadiumCapacity=F('stadium__capacity'))\
                                .order_by("stadiumCapacity")
    
    @staticmethod
    def getClubsWithLeagues():
        return clubSerializer(Club.objects.all(), many=True).data
    
    @staticmethod
    def getSingleClubWithLeague(id):
        return clubSerializer(Club.objects.get(id=id)).data
    
    @staticmethod
    def filterClubByAnnualBudget(budget):
        clubs = Club.objects.filter(annualBudget__gt=budget)
        return clubSerializer(clubs, many=True).data
    
    @staticmethod
    def saveClubWithLeague(club):
        league = club.get("league")
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
            compSerializer = simpleCompetitionSerializer(data=comp)
            obj = None
            if compSerializer.is_valid():
                obj = compSerializer.save()
            else: return True
            compId = obj.id

            matchDetails = comp["matchDetails"]
            matchDetails["competition"] = compId
            matchDetails["club1"] = clubId
            
            matchSerializer = simpleMatchesPlayedSerializer(data=matchDetails)
            if matchSerializer.is_valid():
                matchSerializer.save()
            else: return True
        
        return False
        
class CompetitionLogic:
    @staticmethod
    def getCompetitionsWithLeagueClubs():
        return competitionSerializer(Competition.objects.all(), many=True).data
    
    @staticmethod
    def getsingleCompetitionWithLeagueClub(id):
        return competitionSerializer(Competition.objects.get(id=id)).data
    
    @staticmethod
    def getLeaguesByClubAnnualBudgetQuery():
        return Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("club__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget")
    
    @staticmethod
    def saveCompetitionWithLeagueClubs(comp):
        clubs = comp.get('clubs')

        compSerializer = simpleCompetitionSerializer(data=comp)
        if compSerializer.is_valid():
            compSerializer.save()
        else: return True
        
        newCompId = Competition.objects.last().id

        for club in clubs:
            club['league'] = newCompId
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
            clubSerializer = simpleClubSerializer(data=club)
            obj = None
            if clubSerializer.is_valid():
                obj = clubSerializer.save()
            clubId = obj.id

            matchDetails = club["matchDetails"]
            matchDetails["competition"] = compId
            matchDetails["club1"] = clubId
            
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
    def getMatchesWithDetail():
        return matchesPlayedSerializer(MatchesPlayed.objects.all(), many=True).data
    
    @staticmethod
    def getSingleMatchPlayedWithDetail(id):
        return matchesPlayedSerializer(MatchesPlayed.objects.get(id=id)).data
    
    @staticmethod
    def getCompetitionSpecificMatch(id):
        return matchesPlayedSerializer(MatchesPlayed.objects.get(competition=id)).data
    
    @staticmethod
    def saveCompetitionSpecificMatch(data, id):
        data["competition"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True

        return False
    
    @staticmethod
    def getClubSpecificMatch(id):
        return matchesPlayedSerializer(MatchesPlayed.objects.get(club1=id)).data
    
    @staticmethod
    def saveClubSpecificMatch(data, id):
        data["club1"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
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