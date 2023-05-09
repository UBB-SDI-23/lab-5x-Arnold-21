from rest_framework import serializers
from .models import Stadium, Club, Competition, MatchesPlayed, UserDetail
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

#Token serializer
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['id'] = user.id

        return token
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")
    
#UserDetail Serializer
class UserDetailSerializer(serializers.ModelSerializer):
    NumberOfClubs = serializers.SerializerMethodField("getNumberOfClubs")
    NumberOfStadiums = serializers.SerializerMethodField("getNumberOfStadium")
    NumberOfCompetitions = serializers.SerializerMethodField("getNumberOfCompetitions")
    NumberOfMatches = serializers.SerializerMethodField("getNumberOfMatches")
    userName = UserSerializer(read_only=True)

    class Meta:
        model = UserDetail
        fields = "__all__"

    def validate(self, data):
        if not re.search("^[a-zA-Z0-9 ]*$",data["bio"]) and data["bio"] is not None:
            raise serializers.ValidationError({"error": "Bio can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["location"]) and data["location"] is not None:
            raise serializers.ValidationError({"error": "Location can only contain numbers and letters"})
        if not re.search("^[0-9]{4}-[0-9]{2}-[0-9]{2}$",data["birthday"]) and data["birthday"] is not None:
            raise serializers.ValidationError({"error": "Birthday has to have the following format: yyyy-mm-dd"})
        return data
    
    def getNumberOfClubs(self, userDetail):
        return userDetail.userName.club.count()
    def getNumberOfStadium(self, userDetail):
        return userDetail.userName.stadium.count()
    def getNumberOfCompetitions(self, userDetail):
        return userDetail.userName.competition.count()
    def getNumberOfMatches(self, userDetail):
        return userDetail.userName.match.count()

class StadiumSerializer(serializers.ModelSerializer):
    NumberOfClubs = serializers.IntegerField(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Stadium
        fields = "__all__"
        
    def validate(self, data):
        if type(data["capacity"]) is not int or data["capacity"] < 0:
            raise serializers.ValidationError({"error": "Stadium capacity must be a positive integer"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["city"]):
            raise serializers.ValidationError({"error": "City can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 .,!?;:]*$",data["description"]):
            raise serializers.ValidationError({"error": "Description can only contain numbers and letters"})
        return data
    
class simpleStadiumSerializer(serializers.ModelSerializer):
    NumberOfClubs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Stadium
        fields = "__all__"
        
    def validate(self, data):
        if type(data["capacity"]) is not int or data["capacity"] < 0:
            raise serializers.ValidationError({"error": "Stadium capacity must be a positive integer"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["city"]):
            raise serializers.ValidationError({"error": "City can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 .,!?;:]*$",data["description"]):
            raise serializers.ValidationError({"error": "Description can only contain numbers and letters"})
        return data


class simpleClubSerializer(serializers.ModelSerializer):
    stadiumCapacity = serializers.FloatField(read_only=True)

    class Meta:
        model = Club
        fields = "__all__"

    def validate(self, data):
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if type(data["annualBudget"]) is not int or data["annualBudget"] < 0:
            raise serializers.ValidationError({"error": "Annual Budget must be a positive integer"})
        if type(data["numberOfStadd"]) is not int or data["numberOfStadd"] < 0:
            raise serializers.ValidationError({"error": "Number of Staff must be a positive integer"})
        return data


class simpleCompetitionSerializer(serializers.ModelSerializer):
    avgBudget = serializers.FloatField(read_only=True)

    class Meta:
        model = Competition
        fields = "__all__"

    def validate(self, data):
        if type(data["numberOfTeams"]) is not int or data["numberOfTeams"] < 0:
            raise serializers.ValidationError({"error": "Number of Teams must be a positive integer"})
        if type(data["prizeMoney"]) is not int or data["prizeMoney"] < 0:
            raise serializers.ValidationError({"error": "Prize Money must be a positive integer"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["competitionType"]):
            raise serializers.ValidationError({"error": "Competition Type can only contain numbers and letters"})
        return data


class competitionSerializer(serializers.ModelSerializer):
    clubs = serializers.SerializerMethodField()
    RealNumberOfTeams = serializers.IntegerField(read_only=True)
    user = UserSerializer(read_only=True)

    def get_clubs(self, obj):
        query = obj.league.all()[:30]
        serializer = clubSerializer(query, many=True)
        return serializer.data

    class Meta:
        model = Competition
        fields = "__all__"

    def validate(self, data):
        if type(data["numberOfTeams"]) is not int or data["numberOfTeams"] < 0:
            raise serializers.ValidationError({"error": "Number of Teams must be a positive integer"})
        if type(data["prizeMoney"]) is not int or data["prizeMoney"] < 0:
            raise serializers.ValidationError({"error": "Prize Money must be a positive integer"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["competitionType"]):
            raise serializers.ValidationError({"error": "Competition Type can only contain numbers and letters"})
        return data

class clubSerializer(serializers.ModelSerializer):
    league = simpleCompetitionSerializer(read_only=True)
    stadium = StadiumSerializer(read_only=True)
    matchesPlayed = serializers.IntegerField(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Club
        fields = "__all__"

    def validate(self, data):
        if not re.search("^[a-zA-Z0-9 ]*$",data["name"]):
            raise serializers.ValidationError({"error": "Name can only contain numbers and letters"})
        if type(data["annualBudget"]) is not int or data["annualBudget"] < 0:
            raise serializers.ValidationError({"error": "Annual Budget must be a positive integer"})
        if type(data["numberOfStadd"]) is not int or data["numberOfStadd"] < 0:
            raise serializers.ValidationError({"error": "Number of Staff must be a positive integer"})
        return data


class matchesPlayedSerializer(serializers.ModelSerializer):
    club1 = simpleClubSerializer()
    club2 = simpleClubSerializer()
    competition = simpleCompetitionSerializer()
    stadium = StadiumSerializer()
    avgleaguebudget = serializers.FloatField(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = MatchesPlayed
        fields = "__all__"

    def validate(self, data):
        if data["club1"] == data["club2"]:
            raise serializers.ValidationError({"error": "The club cannot play against itself"})
        if not re.search("^[0-9]{1,2}-[0-9]{1,2}$", data["score"]):
            raise serializers.ValidationError({"error": "Incorrect/Impossible score"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["roundOfPlay"]):
            raise serializers.ValidationError({"error": "Round Of Play can only contain numbers and letters"})
        return data


class simpleMatchesPlayedSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchesPlayed
        fields = "__all__"

    def validate(self, data):
        if data["club1"] == data["club2"]:
            raise serializers.ValidationError({"error": "The club cannot play against itself"})
        if not re.search("^[0-9]{1,2}-[0-9]{1,2}$", data["score"]):
            raise serializers.ValidationError({"error": "Incorrect/Impossible score"})
        if not re.search("^[a-zA-Z0-9 ]*$",data["roundOfPlay"]):
            raise serializers.ValidationError({"error": "Round Of Play can only contain numbers and letters"})
        return data