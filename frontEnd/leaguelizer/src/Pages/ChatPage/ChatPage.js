import React, { useCallback, useMemo, useState } from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button, Card, CardHeader } from '@mui/material'
import { w3cwebsocket as W3CWebSocket } from "websocket";

function ChatPage() {
    let [nickname, setNickname] = useState("");
    let [message, setMessage] = useState("");
    let [ messages, setMessages ] = useState({
        'text1': "",
        'text2': "",
        'text3': "",
        'text4': "",
        'text5': "",
        'sender1': "",
        'sender2': "",
        'sender3': "",
        'sender4': "",
        'sender5': ""
    });
    const client = useMemo(() => new W3CWebSocket('wss://SArnold-sdi-22-23.chickenkiller.com/ws/room/'), []);

    client.onmessage = useCallback((message) => {
        const dataFromServer = JSON.parse(message.data);
        if (dataFromServer) {
            setMessages(dataFromServer);
        }
    }, [setMessages]);

    let messageSend = () => {
        client.send(
            JSON.stringify({
                type: "message",
                text: message,
                sender: nickname,
            })
        );
        setMessage("");
    }

    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <TextField name="nickname" variant="outlined" id="nickname" value={nickname} label="nickname" onChange={(e) => { setNickname(e.target.value) }} sx={{mt:5}}>Nickname</TextField>
                <TextField name="message" variant="outlined" id="message" value={message} label="message" onChange={(e) => { setMessage(e.target.value) }} sx={{mt:5}}>Message</TextField>
            </Grid>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" onClick={messageSend} id='messageBtn'>Send</Button>
            </Grid>
            <Card>
                <CardHeader title={messages.sender1} subheader={messages.text1} key={messages.text1}/>
            </Card>
            <Card>
                <CardHeader title={messages.sender2} subheader={messages.text2} key={messages.text2}/>
            </Card>
            <Card>
                <CardHeader title={messages.sender3} subheader={messages.text3} key={messages.text3}/>
            </Card>
            <Card>
                <CardHeader title={messages.sender4} subheader={messages.text4} key={messages.text4}/>
            </Card>
            <Card>
                <CardHeader title={messages.sender5} subheader={messages.text5} key={messages.text5}/>
            </Card>
        </MainLayout>
    )
}

export default ChatPage