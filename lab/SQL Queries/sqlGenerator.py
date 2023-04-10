from faker import Faker
from random import randint, choice
# from threading import Thread

fake = Faker()

competitionTypeList = ["League", "Knockout"]
roundOfPlayList = ["G", "R16", "QF", "SM", "F", "L"]

sqlText = "USE leaguelizer;\n"

with open("./lab/SQL Queries/data.sql", "w") as file:
        print("Writing Start")
        file.write(sqlText)

NUM_TABLE = 1_000_000
NUM_MANY = 10_000_000
NUM_BATCH = 1_000

def insertStadium():
    name = fake.first_name()
    city = fake.city()
    capacity = randint(10000, 120000)
    buildDate = fake.date()
    rennovationDate = fake.date()
    return f"(\"{name}\", \"{city}\", {capacity}, \"{buildDate}\", \"{rennovationDate}\")"

def insertCompetition():
    name = fake.last_name()
    numberOfTeams = randint(15,20)
    foundedDate = fake.date()
    prizeMoney = randint(10000, 10000000)
    competitionType = choice(competitionTypeList)
    return f"(\"{name}\", {numberOfTeams}, \"{foundedDate}\", {prizeMoney}, \"{competitionType}\")"

def insertClub():
    name = fake.first_name()
    annualBudget = randint(2000, 150000000)
    numberOfStadd = randint(10, 500)
    foundedDate = fake.date()
    stadium = randint(1,1000000)
    league = randint(1,1000000)
    return f"(\"{name}\", {annualBudget}, {numberOfStadd}, \"{foundedDate}\", {stadium}, {league})"

def insertMatches():
    club1 = randint(1,1000000)
    club2 = randint(1,1000000)
    competition = randint(1,1000000)
    stadium = randint(1,1000000)
    roundOfPlay = choice(roundOfPlayList)
    score1 = randint(0,8)
    score2 = randint(0,8)
    date = fake.date()
    return f"({club1}, {club2}, {competition}, {stadium}, \"{roundOfPlay}\", \"{score1}-{score2}\", \"{date}\")"

def addStadiums():
    stadiumText = ""
    print("Stadiums")

    for i in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_stadium(name, city, capacity, buildDate, rennovationDate) values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertStadium() + ", "
        insertText += insertStadium() + ";\n"

        stadiumText += insertText

    with open("./lab/SQL Queries/data.sql", "a") as file:
        print("Writing Stadium")
        file.write(stadiumText)

def addCompetition():
    compText = ""
    print("Competitions")

    for _ in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_competition(name, numberOfTeams, foundedDate, prizeMoney, competitionType) values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertCompetition() + ", "
        insertText += insertCompetition() + ";\n"

        compText += insertText

    with open("./lab/SQL Queries/data.sql", "a") as file:
        print("Writing Competition")
        file.write(compText)

def addClub():
    clubText = ""
    print("Clubs")

    for _ in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_club(name, annualBudget, numberOfStadd, foundedDate, stadium, league) values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertClub() + ", "
        insertText += insertClub() + ";\n"

        clubText += insertText

    with open("./lab/SQL Queries/data.sql", "a") as file:
        print("Writing Club")
        file.write(clubText)

def addMatches():
    matchText = ""
    print("matches")
    for i in range(int(int(NUM_MANY/NUM_BATCH)/5)):
        insertText = "INSERT INTO lab1_api_matchesplayed(club1, club2, competition, stadium, roundOfPlay, score, date) values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertMatches() + ", "
        insertText += insertMatches() + ";\n"

        matchText += insertText

        if (i + 1) % 1_000 == 0:
            with open("lab/SQL Queries/data.sql", "a") as file:
                print("Writing Club")
                file.write(matchText)
                matchText = ""

    with open("./lab/SQL Queries/data.sql", "a") as file:
        print("Writing Club")
        file.write(matchText)

# stadiumThread = Thread(target=addStadiums)
# compThread = Thread(target=addCompetition)
# clubThread = Thread(target=addClub)
# matchThread = Thread(target=addMatches)

# stadiumThread.start()
# compThread.start()
# clubThread.start()
# matchThread.start()

# stadiumThread.join()
# compThread.join()
# clubThread.join()
# matchThread.join()

# sqlText += stadiumText + compText + clubText + matchText

addStadiums()
addCompetition()
addClub()
addMatches()

# with open("./lab/SQL Queries/data.sql", "w") as file:
#     print("Writing")
#     file.write(sqlText)