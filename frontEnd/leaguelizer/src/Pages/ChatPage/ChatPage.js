import React, { useCallback, useContext, useMemo, useState } from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button, Card, CardHeader } from '@mui/material'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import authContext from '../../Context/Context';

function ChatPage() {
    //Seeting up all the neccessary variables for the chat functionality, and getting the url from the context
    let {URL_SOCKET} = useContext(authContext);
    let [nickname, setNickname] = useState("");
    let [message, setMessage] = useState("");
    //Only the last 10 messages are saved, so the frontedn won't be overcrowded and potentially too big
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
    //Initiating the websocket, through the url from the context
    const client = useMemo(() => new W3CWebSocket(URL_SOCKET), [URL_SOCKET]);

    //Function which handles adding an element to the front of the list, so the last message is always at the top
    //It returns a news list, from the old one
    const changeMessages = (messages, dataFromServer) => {
        if (dataFromServer.text === ""){
            return messages;
        }
        
        messages.unshift({msg: dataFromServer.text, name: dataFromServer.sender})
        messages.pop()
        return messages
    }

    //Binding the message list change function to the websocket, so if there is an incoming message, it will be handled
    //The two setMessages were needed, since useState list variables still can't handle direct operations
    client.onmessage = useCallback((message) => {
        const dataFromServer = JSON.parse(message.data);
        if (dataFromServer) {
            setMessages(messages => changeMessages(messages, dataFromServer));
            setMessages(messages => [...messages])
        }
    }, []);

    //Button triggered function, which sends the user's message to the websocket
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

    /* This is the JSX code that defines the layout and functionality of the ChatPage component. It
    returns a MainLayout component that contains a Grid container with two TextFields for the user
    to input their nickname and message, and a Button to send the message. Below that, it maps
    through the messages state variable and renders a Card component for each message that has a
    non-empty message text. The CardHeader displays the message text and the sender's name. */
    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <TextField name="nickname" variant="outlined" id="nickname" value={nickname} label="nickname" onChange={(e) => { setNickname(e.target.value) }} sx={{mt:5}}>Nickname</TextField>
                <TextField name="message" variant="outlined" id="message" value={message} label="message" onChange={(e) => { setMessage(e.target.value) }} sx={{mt:5}}>Message</TextField>
            </Grid>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5, mb:5 }}>
                <Button variant="contained" onClick={messageSend} id='messageBtn' sx={{width:150, height:50}}>Send</Button>
            </Grid>
            <hr></hr>
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