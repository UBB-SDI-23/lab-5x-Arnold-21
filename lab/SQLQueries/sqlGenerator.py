from faker import Faker
from random import randint, choice
from threading import Thread
from datetime import datetime, timedelta

fake = Faker()

competitionTypeList = ["League", "Knockout"]
roundOfPlayList = ["G", "R16", "QF", "SM", "F", "L"]

sqlText = "\c leaguelizer;\n"

with open("lab/SQLQueries/data3.sql", "w") as file:
    print("Writing")
    file.write(sqlText)

stadiumText = ""
compText = ""
clubText = ""
matchText = ""

NUM_TABLE = 1_000_000
NUM_MANY = 10_000_000
NUM_BATCH = 1_000

def insertStadium():
    name = fake.first_name()
    city = fake.city()
    description = fake.paragraph(nb_sentences = 10)
    capacity = randint(10000, 120000)
    buildDate = fake.date()
    rennovationDate = fake.date()
    user = randint(3, 10002)
    return f"(\'{name}\', \'{city}\', \'{description}\', {capacity}, \'{buildDate}\', \'{rennovationDate}\', {user})"

def insertCompetition():
    name = fake.last_name()
    numberOfTeams = randint(15,20)
    foundedDate = fake.date()
    prizeMoney = randint(10000, 10000000)
    competitionType = choice(competitionTypeList)
    user = randint(3, 10002)
    return f"(\'{name}\', {numberOfTeams}, \'{foundedDate}\', {prizeMoney}, \'{competitionType}\', {user})"

def insertClub():
    name = fake.first_name()
    annualBudget = randint(2000, 150000000)
    numberOfStadd = randint(10, 500)
    foundedDate = fake.date()
    stadium = randint(1,1000000)
    league = randint(1,1000000)
    user = randint(3, 10002)
    return f"(\'{name}\', {annualBudget}, {numberOfStadd}, \'{foundedDate}\', {stadium}, {league}, {user})"

def insertMatches():
    club1 = randint(1,1000000)
    club2 = randint(1,1000000)
    competition = randint(1,1000000)
    stadium = randint(1,1000000)
    roundOfPlay = choice(roundOfPlayList)
    score1 = randint(0,8)
    score2 = randint(0,8)
    date = fake.date()
    user = randint(3, 10002)
    return f"({club1}, {club2}, {competition}, {stadium}, \'{roundOfPlay}\', \'{score1}-{score2}\', \'{date}\', {user})"

def addStadiums():
    global stadiumText
    print("Stadiums")

    for _ in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_stadium(\"name\", \"city\", \"description\", \"capacity\", \"buildDate\", \"renovationDate\", \"user_id\") values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertStadium() + ", "
        insertText += insertStadium() + ";\n"

        stadiumText += insertText

    with open("lab/SQLQueries/data3.sql", "a") as file:
        file.write(stadiumText)

def addCompetition():
    global compText
    print("Competitions")

    for _ in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_competition(\"name\", \"numberOfTeams\", \"foundedDate\", \"prizeMoney\", \"competitionType\", \"user_id\") values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertCompetition() + ", "
        insertText += insertCompetition() + ";\n"

        compText += insertText

    with open("lab/SQLQueries/data3.sql", "a") as file:
        file.write(compText)

def addClub():
    global clubText
    print("Clubs")

    for _ in range(int(NUM_TABLE/NUM_BATCH)):
        insertText = "INSERT INTO lab1_api_club(\"name\", \"annualBudget\", \"numberOfStadd\", \"foundedDate\", \"stadium_id\", \"league_id\", \"user_id\") values "
        for _ in range(NUM_BATCH - 1):
            insertText += insertClub() + ", "
        insertText += insertClub() + ";\n"

        clubText += insertText

    with open("lab/SQLQueries/data3.sql", "a") as file:
        file.write(clubText)

def addMatches():
    global matchText
    print("matches")
    
    for i in range(int(int(NUM_MANY/NUM_BATCH))):
        insertText = "INSERT INTO lab1_api_matchesplayed(\"club1_id\", \"club2_id\", \"competition_id\", \"stadium_id\", \"roundOfPlay\", \"score\", \"date\", \"user_id\") values "
        for j in range(NUM_BATCH - 1):
            insertText += insertMatches() + ", "
        insertText += insertMatches() + ";\n"

        matchText += insertText

        if int((i + 1) % 500) == 0:
            with open("lab/SQLQueries/data3.sql", "a") as file:
                file.write(matchText)

            matchText = ""

    # with open("lab/SQL Queries/data.sql", "a") as file:
    #     print("Writing Club")
    #     file.write(matchText)

stadiumThread = Thread(target=addStadiums)
compThread = Thread(target=addCompetition)
clubThread = Thread(target=addClub)
matchThread = Thread(target=addMatches)

start = datetime.now()

stadiumThread.start()
compThread.start()
clubThread.start()
matchThread.start()

stadiumThread.join()
compThread.join()
clubThread.join()
matchThread.join()

end = datetime.now()
print(end-start)

# sqlText += stadiumText + compText + clubText + matchText

# addStadiums()
# addCompetition()
# addClub()
# addMatches()

# with open("lab/SQLQueries/data2.sql", "w") as file:
#     print("Writing")
#     file.write(sqlText)