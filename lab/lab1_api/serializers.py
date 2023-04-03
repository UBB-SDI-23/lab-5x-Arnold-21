from rest_framework import serializers
from .models import Stadium, Club, Competition, MatchesPlayed

class StadiumSerializer(serializers.ModelSerializer):
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
    clubs = simpleClubSerializer(source='club_set', many=True)
    class Meta:
        model = Competition
        fields = "__all__"

class clubSerializer(serializers.ModelSerializer):
    league = simpleCompetitionSerializer(read_only=True)

    class Meta:
        model = Club
        fields = "__all__"


class matchesPlayedSerializer(serializers.ModelSerializer):
    club1 = simpleClubSerializer()
    club2 = simpleClubSerializer()
    competition = simpleCompetitionSerializer()
    stadium = StadiumSerializer()

    class Meta:
        model = MatchesPlayed
        fields = "__all__"


class simpleMatchesPlayedSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchesPlayed
        fields = "__all__"