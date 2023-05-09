from faker import Faker
from random import randint, choice
from threading import Thread
from datetime import datetime, timedelta

fake = Faker()

sqlText = "\c leaguelizer;\n"