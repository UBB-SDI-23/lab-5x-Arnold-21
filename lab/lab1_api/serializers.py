from rest_framework import serializers
from .models import Stadium, Club, Competition, MatchesPlayed, UserDetail
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

#Token serializer
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['id'] = user.id

        return token
    
#UserDetail Serializer
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = "__all__"

class StadiumSerializer(serializers.ModelSerializer):
    NumberOfClubs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Stadium
        fields = "__all__"
        
    def validate(self, data):
        if data["capacity"] < 0:
            raise serializers.ValidationError({"error": "Stadium capacity should be higher than 0"})
        return data


class simpleClubSerializer(serializers.ModelSerializer):
    stadiumCapacity = serializers.FloatField(read_only=True)

    class Meta:
        model = Club
        fields = "__all__"


class simpleCompetitionSerializer(serializers.ModelSerializer):
    avgBudget = serializers.FloatField(read_only=True)

    class Meta:
        model = Competition
        fields = "__all__"

    def validate(self, data):
        if data["numberOfTeams"] < 0:
            raise serializers.ValidationError({"error": "The number of teams should be higher than 0"})
        if data["prizeMoney"] < 0:
            raise serializers.ValidationError({"error": "You can't take money for participation"})
        
        return data


class competitionSerializer(serializers.ModelSerializer):
    clubs = serializers.SerializerMethodField()
    RealNumberOfTeams = serializers.IntegerField(read_only=True)

    def get_clubs(self, obj):
        query = obj.league.all()[:30]
        serializer = clubSerializer(query, many=True)
        return serializer.data

    class Meta:
        model = Competition
        fields = "__all__"

    def validate(self, data):
        if data["numberOfTeams"] < 0:
            raise serializers.ValidationError({"error": "The number of teams should be higher than 0"})
        if data["prizeMoney"] < 0:
            raise serializers.ValidationError({"error": "You can't take money for participation"})
        
        return data

class clubSerializer(serializers.ModelSerializer):
    league = simpleCompetitionSerializer(read_only=True)
    stadium = StadiumSerializer(read_only=True)
    matchesPlayed = serializers.IntegerField(read_only=True)

    class Meta:
        model = Club
        fields = "__all__"


class matchesPlayedSerializer(serializers.ModelSerializer):
    club1 = simpleClubSerializer()
    club2 = simpleClubSerializer()
    competition = simpleCompetitionSerializer()
    stadium = StadiumSerializer()
    avgleaguebudget = serializers.FloatField(read_only=True)

    class Meta:
        model = MatchesPlayed
        fields = "__all__"

    def validate(self, data):
        if data["club1"] == data["club2"]:
            raise serializers.ValidationError({"error": "The club cannot play against itself"})
        if (re.search("^[0-9]{1,2}-[0-9]{1,2}$", data["score"]) == None):
            raise serializers.ValidationError({"error": "Incorrect/Impossible score"})
        
        return data


class simpleMatchesPlayedSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchesPlayed
        fields = "__all__"

    def validate(self, data):
        if data["club1"] == data["club2"]:
            raise serializers.ValidationError({"error": "The club cannot play against itself"})
        if (re.search("^[0-9]{1,2}-[0-9]{1,2}$", data["score"]) == None):
            raise serializers.ValidationError({"error": "Incorrect/Impossible score"})
        
        return data