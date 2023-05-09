from faker import Faker
from random import randint, choice
import hashlib

fake = Faker()

sqlText = "\c leaguelizer;\n"

def insertUser(i):
    email = fake.email()
    username = "user" + str(i)
    password = hashlib.sha256("Testing123.".encode()).hexdigest()
