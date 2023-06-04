from rest_framework.test import APITestCase
from ..models import Club, Stadium, Competition
from rest_framework.serializers import ValidationError
from ..serializers import StadiumSerializer, simpleCompetitionSerializer, competitionSerializer

#Testing the basic functionalities
class TestStatistics(APITestCase):
    def setUp(self) -> None:
        self.stadium1 = Stadium.objects.create(name = "testS", city = "test", capacity = 150, buildDate = "1889-05-15", renovationDate = "1889-05-15")
        self.stadium2 = Stadium.objects.create(name = "testS2", city = "test", capacity = 10, buildDate = "1889-05-15", renovationDate = "1889-05-15")
        self.league1 = Competition.objects.create(name = "league1", numberOfTeams = 2, foundedDate = "1889-05-15", prizeMoney = 15, competitionType = "League")
        self.league2 = Competition.objects.create(name = "league2", numberOfTeams = 2, foundedDate = "1889-05-15", prizeMoney = 15, competitionType = "League")
        self.club1 = Club.objects.create(name = "test", annualBudget = 100, numberOfStadd = 10, foundedDate = "1889-05-15", stadium = self.stadium1, league = self.league1)
        self.club2 = Club.objects.create(name = "test2", annualBudget = -100, numberOfStadd = 10, foundedDate = "1889-05-15", stadium = self.stadium2, league = self.league2)
    

    def testClubAnnualBudgetFilter(self):
        """
        This is a unit test function in Python that tests the club annual budget filter and checks if
        the result data contains only one item with the name "test".
        """
        result = self.client.get("/clubs/filter/0/")
        self.assertEqual(len(result.data), 1)
        self.assertEqual(result.data[0]["name"], "test")

    def testClubByStadiumCapacity(self):
        """
        This is a unit test function that checks if the API endpoint "/clubsByStadiumCapacity" returns
        the expected data.
        """
        result = self.client.get("/clubsByStadiumCapacity")
        self.assertEqual(len(result.data), 2)
        self.assertEqual(result.data[0]["name"], "test2")
        self.assertEqual(result.data[0]["stadiumCapacity"], 10)
        self.assertEqual(result.data[1]["name"], "test")
        self.assertEqual(result.data[1]["stadiumCapacity"], 150)

    def testLeagueByAnnualBudget(self):
        """
        This is a unit test function that tests the API endpoint "/leaguesByAnnualBudget" and checks if
        it returns the expected data.
        """
        result = self.client.get("/leaguesByAnnualBudget")
        self.assertEqual(len(result.data), 2)
        self.assertEqual(result.data[0]["name"], "league1")
        self.assertEqual(result.data[0]["avgBudget"], 100)
        self.assertEqual(result.data[1]["name"], "league2")
        self.assertEqual(result.data[1]["avgBudget"], -100)

    def testStadiumValidations(self):
        """
        The function tests the validation of stadium data using two dictionaries and the
        StadiumSerializer.
        """
        stadium3 = {"name": "testS", "city": "test", "capacity": -150, "buildDate": "1889-05-15", "renovationDate": "1889-05-15"}
        stadium4 = {"name": "testS", "city": "test", "capacity": 150, "buildDate": "1889-05-15", "renovationDate": "1889-05-15"}
        serializer = StadiumSerializer(data=stadium3)
        self.assertEqual(serializer.is_valid(), False)
        serializer = StadiumSerializer(data=stadium4)
        self.assertEqual(serializer.is_valid(), True)

    def testCompetitionValidations(self):
        """
        This function tests the validation of competition data using different input values.
        """
        comp1 = {"name": "league1", "numberOfTeams": 2, "foundedDate": "1889-05-15", "prizeMoney": 15, "competitionType": "League"}
        comp2 = {"name": "league1", "numberOfTeams": -2, "foundedDate": "1889-05-15", "prizeMoney": 15, "competitionType": "League"}
        comp3 = {"name": "league1", "numberOfTeams": 2, "foundedDate": "1889-05-15", "prizeMoney": 15, "competitionType": "League"}
        comp4 = {"name": "league1", "numberOfTeams": 2, "foundedDate": "1889-05-15", "prizeMoney": -15, "competitionType": "League"}
        serializer = simpleCompetitionSerializer(data=comp1)
        self.assertEqual(serializer.is_valid(), True)
        serializer = simpleCompetitionSerializer(data=comp2)
        self.assertEqual(serializer.is_valid(), False)
        serializer = simpleCompetitionSerializer(data=comp3)
        self.assertEqual(serializer.is_valid(), True)
        serializer = simpleCompetitionSerializer(data=comp4)
        self.assertEqual(serializer.is_valid(), False)
