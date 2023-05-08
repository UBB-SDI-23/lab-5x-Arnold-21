import { React, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import URL_BASE from "./constants";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

export default function CustomForm(props) {
    const [club1Value, setClub1Value] = useState(props.value.club1.name);
    const [club2Value, setClub2Value] = useState(props.value.club2.name);
    const [compValue, setCompValue] = useState(props.value.competition.name);
    const [stadiumValue, setStadiumValue] = useState(props.value.stadium.name);
    const [roundValue, setRoundValue] = useState(props.value.roundOfPlay);
    const [scoreValue, setScoreValue] = useState(props.value.score);
    const [dateValue, setDateValue] = useState(props.value.date);

    useEffect(() => {
        setClub1Value(props.value.club1.name)
        setClub2Value(props.value.club2.name)
        setCompValue(props.value.competition.name)
        setStadiumValue(props.value.stadium.name)
        setRoundValue(props.value.roundOfPlay)
        setScoreValue(props.value.score)
        setDateValue(props.value.date)
    }, [props]);

    function validateMatch(){
        if (!/^[0-9]{1,2}-[0-9]{1,2}$/.test(scoreValue)){
            ToasterError("Incorrect/Impossible Score!");
            return false;
        }
        if (club1Value === club2Value){
            ToasterError("The team cannot play with itself!");
            return false;
        }
        if (!/^[0-9]+$/.test(club1Value)){
            ToasterError("Invalid club1 id");
            return false;
        }
        if (!/^[0-9]+$/.test(club2Value)){
            ToasterError("Invalid club2 id");
            return false;
        }
        if (!/^[0-9]+$/.test(compValue)){
            ToasterError("Invalid competition id");
            return false;
        }
        if (!/^[0-9]+$/.test(stadiumValue)){
            ToasterError("Invalid stadium id");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]*$/.test(roundValue)){
            ToasterError("Invalid Round of play");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateValue)){
            ToasterError("Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        return true;
    }

    const postButtonHandler = () => {
        if (!validateMatch())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "club1": club1Value,
                "club2": club2Value,
                "competition": compValue,
                "stadium": stadiumValue,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue
            })
        };

        fetch(URL_BASE, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const putButtonHandler = () => {
        if (!validateMatch())
            return;
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "club1": (/^[0-9]+$/.test(club1Value)) ? club1Value : props.value.club1.id,
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : props.value.club2.id,
                "competition": (/^[0-9]+$/.test(compValue)) ? compValue : props.value.competition.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : props.value.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const deleteButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE'
        };

        const URL = URL_BASE + String(props.value.id)

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    return (
        <form className="stadiumForm">
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <TextField variant="outlined" id="club1" value={club1Value} label="Club1" onChange={(e) => {setClub1Value(e.target.value)}}>Club1</TextField>
                <TextField variant="outlined" id="club2" value={club2Value} label="Club2" onChange={(e) => {setClub2Value(e.target.value)}}>Club2</TextField>
                <TextField variant="outlined" id="comp" value={compValue} label="Competition" onChange={(e) => {setCompValue(e.target.value)}}>Competition</TextField>
                <TextField variant="outlined" id="stadium" value={stadiumValue} label="Stadium" onChange={(e) => {setStadiumValue(e.target.value)}}>Stadium</TextField>
                <TextField variant="outlined" id="round" value={roundValue} label="Round Of Play" onChange={(e) => {setRoundValue(e.target.value)}}>Round Of Play</TextField>
                <TextField variant="outlined" id="score" value={scoreValue} label="Score" onChange={(e) => {setScoreValue(e.target.value)}}
                    sx={{width:"40%", mt:3}}
                >Score</TextField>
                <TextField variant="outlined" id="date" value={dateValue} label="Date" onChange={(e) => {setDateValue(e.target.value)}}
                    sx={{width:"40%", mt:3}}
                >Date</TextField>
            </Grid>
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button>
            </Grid>
        </form>
    );
}