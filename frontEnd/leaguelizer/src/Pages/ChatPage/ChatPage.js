import React, { useCallback, useMemo, useState } from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button, Card, CardHeader } from '@mui/material'
import { w3cwebsocket as W3CWebSocket } from "websocket";

function ChatPage() {
    let [nickname, setNickname] = useState("");
    let [message, setMessage] = useState("");
    let [ messages, setMessages ] = useState([
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""},
        {msg: "", name: ""}
    ]);
    const client = useMemo(() => new W3CWebSocket('wss://SArnold-sdi-22-23.chickenkiller.com/ws/room/'), []);

    const changeMessages = (messages, dataFromServer) => {
        if (dataFromServer.text === ""){
            return messages;
        }
        
        messages.unshift({msg: dataFromServer.text, name: dataFromServer.sender})
        messages.pop()
        return messages
    }

    client.onmessage = useCallback((message) => {
        const dataFromServer = JSON.parse(message.data);
        if (dataFromServer) {
            setMessages(messages => changeMessages(messages, dataFromServer));
            setMessages(messages => [...messages])
        }
    }, []);

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
            {messages.map((message) => (
                <>
                  {message.msg !== "" ?
                    <Card>
                        <CardHeader title={message.msg} subheader={message.name} key={message.msg}/>
                    </Card> : <></>}
                </>
            ))}
        </MainLayout>
    )
}

export default ChatPage