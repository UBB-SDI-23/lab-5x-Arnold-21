from django.db import models

# Create your models here.
class Stadium(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    description = models.TextField()
    capacity = models.IntegerField()
    buildDate = models.DateField()
    renovationDate = models.DateField()

    def __str__(self):
        return self.name
    
class Competition(models.Model):
    name = models.CharField(max_length=100)
    numberOfTeams = models.IntegerField()
    foundedDate = models.DateField()
    prizeMoney = models.IntegerField()
    competitionType = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    
class Club(models.Model):
    name = models.CharField(max_length=100)
    annualBudget = models.IntegerField()
    numberOfStadd = models.IntegerField()
    foundedDate = models.DateField()
    stadium = models.ForeignKey(Stadium, related_name="stadium", on_delete=models.SET_NULL, null=True)
    league = models.ForeignKey(Competition, related_name="league", on_delete=models.SET_NULL, null = True)

    def __str__(self):
        return self.name
    
class MatchesPlayed(models.Model):
    club1 = models.ForeignKey(Club, related_name="related_club1", on_delete=models.CASCADE)
    club2 = models.ForeignKey(Club, related_name="related_club2", on_delete=models.CASCADE)
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
    stadium = models.ForeignKey(Stadium, on_delete=models.CASCADE)

    roundOfPlay = models.CharField(max_length=100)
    score = models.CharField(max_length=100)
    date = models.DateField()
