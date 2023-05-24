# app/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

import django
django.setup()

from .models import MessageLog

class TextRoomConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = 'room'
        self.room_group_name = 'chat_room'
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            'chat_room',
            self.channel_name
        )
        self.accept()
        
    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            'chat_room',
            self.channel_name
        )

    def receive(self, text_data):
        # Receive message from WebSocket
        text_data_json = json.loads(text_data)
        text = text_data_json['text']
        sender = text_data_json['sender']
        
        #log
        MessageLog.objects.create(sender=sender, message=text)

        #Get last 5 messages
        messageCount = MessageLog.objects.count()
        messages = MessageLog.objects.all()[messageCount - 11:]
        messagesList = [{'message': message.message, 'sender': message.sender} for message in messages]
        
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            'chat_room',
            {
                'type': 'chat_message',
                'message1': messagesList[0]['message'],
                'message2': messagesList[1]['message'],
                'message3': messagesList[2]['message'],
                'message4': messagesList[3]['message'],
                'message5': messagesList[4]['message'],
                'sender1': messagesList[0]['sender'],
                'sender2': messagesList[1]['sender'],
                'sender3': messagesList[2]['sender'],
                'sender4': messagesList[3]['sender'],
                'sender5': messagesList[4]['sender']
            }
        )

    def chat_message(self, event):
        # Receive message from room group
        text1 = event['message1']
        text2 = event['message2']
        text3 = event['message3']
        text4 = event['message4']
        text5 = event['message5']
        sender1 = event['sender1']
        sender2 = event['sender2']
        sender3 = event['sender3']
        sender4 = event['sender4']
        sender5 = event['sender5']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'text1': text1,
            'text2': text2,
            'text3': text3,
            'text4': text4,
            'text5': text5,
            'sender1': sender1,
            'sender2': sender2,
            'sender3': sender3,
            'sender4': sender4,
            'sender5': sender5
        }))