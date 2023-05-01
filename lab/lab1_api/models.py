from django.db import models
from django.contrib.auth.models import AbstractUser

# Create user models
class User(AbstractUser):
    class Role(models.TextChoices):
        REGULAR = "Regular", 'Regular'
        MODERATOR = "Moderator", 'Moderator'
        Admin = "Admin", 'Admin'

    role = models.CharField(max_length=30, choices=Role.choices, default='R')
    confirmation_code = models.CharField(max_length=20, blank=True)
    confirmation_start = models.DateTimeField(blank=True, null=True)

class UserDetail(models.Model):
    genderChoices = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    maritalChoices = [
        ('M', 'Married'),
        ('R', 'Relationship'),
        ('S', 'Single')
    ]

    userName = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=100, blank=True)
    birthday = models.DateField(blank=True)
    gender = models.CharField(max_length=2, choices=genderChoices, blank=True)
    marital = models.CharField(max_length=2, choices=maritalChoices, blank=True)


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
