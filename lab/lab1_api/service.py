from .serializers import *
from .models import *
from django.db.models import Count, Q, Avg
from math import ceil

class StadiumLogic:
    @staticmethod
    def getPagedStadiums(page):
        return StadiumSerializer(Stadium.objects.all()[100*(page - 1):100*page], many = True).data
    
    @staticmethod
    def getAutocompleteStadium(name):
        return StadiumSerializer(Stadium.objects.filter(name__icontains=name)[:20], many = True).data
    
    @staticmethod
    def getPageNumber():
        return ceil(Stadium.objects.all().count()/100)
        

class ClubLogic:
    @staticmethod
    def getPageNumber():
        return ceil(Club.objects.all().count()/100)
    
    @staticmethod
    def getBudgetFilteredPageNumber(budget):
        return ceil(Club.objects.filter(annualBudget__gt=budget).count()/100)
    
    @staticmethod
    def getPagedClubs(page):
        return clubSerializer(Club.objects.annotate(matchesPlayed=Count("related_club1"))[100*(page - 1):100*page], many = True).data
    
    @staticmethod
    def getAutocompleteClub(name):
        return clubSerializer(Club.objects.filter(name__icontains=name)[:20], many = True).data
    
    @staticmethod
    def getStadiumCapacityStatisticsPageNumber():
        return ceil(Club.objects.annotate(stadiumCapacity=Avg('stadium__capacity'))\
                                        .order_by("stadiumCapacity").count()/100)

    @staticmethod
    def getStadiumCapacityStatistics(page):
        return simpleClubSerializer(Club.objects.annotate(stadiumCapacity=Avg('stadium__capacity'))\
                                        .order_by("stadiumCapacity")[100*(page - 1):100*page], many=True).data
    
    @staticmethod
    def getSingleClubWithLeague(id):
        return clubSerializer(Club.objects.get(id=id)).data
    
    @staticmethod
    def filterClubByAnnualBudget(budget, page):
        return clubSerializer(Club.objects.filter(annualBudget__gt=budget)[100*(page - 1):100*page], many=True).data
    
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
    def getPageNumber():
        return ceil(Competition.objects.all().count()/100)
    
    @staticmethod
    def getPagedComps(page):
        return competitionSerializer(Competition.objects.annotate(RealNumberOfTeams=Count("league"))[100*(page - 1):100*page], many = True).data
    
    @staticmethod
    def getAutocompleteComps(name):
        return competitionSerializer(Competition.objects.filter(name__icontains=name)[:20], many = True).data
    
    @staticmethod
    def getsingleCompetitionWithLeagueClub(id):
        return competitionSerializer(Competition.objects.get(id=id)).data
    
    @staticmethod
    def getLeaguesByClubAnnualBudgetPageNumber():
        return ceil(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget").count()/100)
    
    @staticmethod
    def getLeaguesByClubAnnualBudget(page):
        return simpleCompetitionSerializer(Competition.objects\
                    .filter(competitionType="League")\
                    .annotate(avgBudget=Avg("league__annualBudget"))\
                    .exclude(avgBudget=None)\
                    .order_by("-avgBudget")[100*(page - 1):100*page], many=True).data
    
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
    def getPageNumber():
        return ceil(MatchesPlayed.objects.all().count()/100)
    
    @staticmethod
    def getPagedMatches(page):
        return matchesPlayedSerializer(MatchesPlayed.objects.raw('select *, (select AVG("annualBudget") from lab1_api_club where "league_id" = "competition_id") as AvgLeagueBudget from lab1_api_matchesplayed limit ' + str(100*page) + ' offset ' + str(100*(page - 1))), many=True).data
    
    @staticmethod
    def getSingleMatchPlayedWithDetail(id):
        return matchesPlayedSerializer(MatchesPlayed.objects.get(id=id)).data
    
    @staticmethod
    def getAutocompleteDates(date):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(date__regex=date)[:20], many = True).data
    
    @staticmethod
    def getCompetitionSpecificMatch(id, page):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(competition=id)[100*(page - 1):100*page], many=True).data
    
    @staticmethod
    def getCompetitionSpecificPageNumber(id):
        return ceil(MatchesPlayed.objects.filter(competition=id).count()/100)
    
    @staticmethod
    def saveCompetitionSpecificMatch(data, id):
        data["competition"] = id
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
    def getClubSpecificMatch(id, page):
        return matchesPlayedSerializer(MatchesPlayed.objects.filter(club1=id)[100*(page - 1):100*page], many=True).data
    
    @staticmethod
    def getClubSpecificPageNumber(id):
        return ceil(MatchesPlayed.objects.filter(club1=id).count()/100)
    
    @staticmethod
    def saveClubSpecificMatch(data, id):
        data["club1"] = id
        serializer = simpleMatchesPlayedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else: return True
        
        return False
    
    @staticmethod
    def updateClubSpecificMatch(data):
        mat = MatchesPlayed.objects.get(id=data["id"])
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