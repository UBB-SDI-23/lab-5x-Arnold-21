from faker import Faker
from random import choice

fake = Faker()

sqlText = "\c leaguelizer;\n"

with open("lab/SQLQueries/data6.sql", "w") as file:
    print("Writing")
    file.write(sqlText)

genders = ["F", "M", "O"]
maritals = ["S", "M", "R"]
roles = ["Regular", "Moderator", "Admin"]

def insertUser(i):
    email = fake.email()
    username = "user" + str(i)
    password = "pbkdf2_sha256$390000$K5xVAgN90Uou1h0zhG741t$8j/0FuXtEKq7l10sr465eDGKnrD982I6Fmir8iGl8Rs="
    is_active=True
    role = choice(roles)
    time = "2023-05-10 02:41:47.490861+00:00"
    return f"(\'{email}\', \'{username}\', \'{password}\', {is_active}, \'{role}\', False, \'\', \'\', False, \'{time}\')"

def insertDetail(i):
    bio = fake.paragraph(nb_sentences = 1)
    location = fake.city()
    birthday = fake.date()
    gender = choice(genders)
    marital = choice(maritals)
    return f"(\'{i}\', \'{bio}\', \'{location}\', \'{birthday}\', \'{gender}\', \'{marital}\', 12)"

# insertText = "INSERT INTO lab1_api_user(\"email\", \"username\", \"password\", \"is_active\", \"role\", \"is_superuser\", \"first_name\", \"last_name\", \"is_staff\", \"date_joined\") values "

# for i in range(10000 - 1):
#     insertText += insertUser(i) + ", "
# insertText += insertUser(9999) + ";\n"

# with open("lab/SQLQueries/data4.sql", "a") as file:
#         file.write(insertText)

insertText = "INSERT INTO lab1_api_userdetail(\"userName_id\", \"bio\", \"location\", \"birthday\", \"gender\", \"marital\", \"paginationValue\") values "

for i in range(1,10001):
    insertText += insertDetail(i) + ", "

with open("lab/SQLQueries/data6.sql", "a") as file:
        file.write(insertText)

# NUM_TABLE = 1_000_000
# NUM_MANY = 10_000_000
# NUM_BATCH = 1_000

# def updateStadium():
#     insertText = ""

#     for i in range(int(int(NUM_TABLE/100))):
#         insertText += f"update lab1_api_stadium set user_id = {i+3} where id >= {100*i} and id < {100*(i+1)};\n"

#     with open("lab/SQLQueries/data6.sql", "a") as file:
#             file.write(insertText)

# def updateClub():
#     insertText = ""

#     for i in range(int(int(NUM_TABLE/100))):
#         insertText += f"update lab1_api_club set user_id = {i+3} where id >= {100*i} and id < {100*(i+1)};\n"

#     with open("lab/SQLQueries/data6.sql", "a") as file:
#             file.write(insertText)

# def updateCompetition():
#     insertText = ""

#     for i in range(int(int(NUM_TABLE/100))):
#         insertText += f"update lab1_api_competition set user_id = {i+3} where id >= {100*i} and id < {100*(i+1)};\n"

#     with open("lab/SQLQueries/data6.sql", "a") as file:
#             file.write(insertText)

# def updateMatches():
#     insertText = ""

#     for i in range(int(int(NUM_MANY/1000))):
#         insertText += f"update lab1_api_matchesplayed set user_id = {i+3} where id >= {100*i} and id < {100*(i+1)};\n"

#     with open("lab/SQLQueries/data6.sql", "a") as file:
#             file.write(insertText)

# updateStadium()
# updateCompetition()
# updateClub()
# updateMatches()