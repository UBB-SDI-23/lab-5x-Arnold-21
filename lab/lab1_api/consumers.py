# app/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab1.settings')
django.setup()

from .models import MessageLog

# This is a Python class for a WebSocket consumer that allows users to send and receive messages in a
# chat room.
class TextRoomConsumer(WebsocketConsumer):
    def connect(self):
        """
        This function connects a user to a chat room group.
        """
        self.room_name = 'room'
        self.room_group_name = 'chat_room'
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            'chat_room',
            self.channel_name
        )
        self.accept()
        
    def disconnect(self, close_code):
        """
        This function removes the current channel from the 'chat_room' group.
        
        :param close_code: The close code parameter is an integer code that indicates the reason for
        closing the WebSocket connection. It is typically used to indicate whether the connection was
        closed normally or due to an error or timeout. The specific values and meanings of close codes
        are defined in the WebSocket protocol
        """
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            'chat_room',
            self.channel_name
        )

    def receive(self, text_data):
        """
        This function receives a message from a WebSocket, logs it, and sends it to a room group.
        
        :param text_data: The data received from the WebSocket connection in the form of a string
        """
        # Receive message from WebSocket
        text_data_json = json.loads(text_data)
        text = text_data_json['text']
        sender = text_data_json['sender']
        
        #log
        MessageLog.objects.create(sender=sender, message=text)
        
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            'chat_room',
            {
                'type': 'chat_message',
                'message': text,
                'sender': sender
            }
        )

    def chat_message(self, event):
        """
        This function sends a chat message to a WebSocket with the message text and sender information.
        
        :param event: The event parameter is a dictionary that contains information about the message
        received from the room group. It may contain keys such as 'message' and 'sender', which are used
        in the function to extract the message text and sender information
        """
        # Receive message from room group
        text = event['message']
        sender = event['sender']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'text': text,
            'sender': sender
        }))