FROM python:3.9.6

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
RUN pip install tensorflow
RUN pip install numpy
RUN pip install pandas
RUN pip install gunicorn
RUN pip install uvicorn
COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY . .