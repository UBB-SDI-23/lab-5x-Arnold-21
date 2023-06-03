import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";
import "./Form.css"

export default function CustomForm(props) {
    /* This code is using the `useContext` hook to access the `user` and `tokens` values from the
    `authContext` context. It is also using the `useState` hook to initialize and manage the state
    of several variables (`club1Value`, `club2Value`, `compValue`, `stadiumValue`, `roundValue`,
    `scoreValue`, and `dateValue`) based on the `props` passed to the component. These variables are
    used to populate and update the form fields in the component. */
    let {user, tokens, URL_BASE} = useContext(authContext);
    const [club1Value, setClub1Value] = useState(props.value.club1.name);
    const [club2Value, setClub2Value] = useState(props.value.club2.name);
    const [compValue, setCompValue] = useState(props.value.competition.name);
    const [stadiumValue, setStadiumValue] = useState(props.value.stadium.name);
    const [roundValue, setRoundValue] = useState(props.value.roundOfPlay);
    const [scoreValue, setScoreValue] = useState(props.value.score);
    const [dateValue, setDateValue] = useState(props.value.date);

    //Everytim the page is refreshed, the values are changed by this function
    useEffect(() => {
        setClub1Value(props.value.club1.name)
        setClub2Value(props.value.club2.name)
        setCompValue(props.value.competition.name)
        setStadiumValue(props.value.stadium.name)
        setRoundValue(props.value.roundOfPlay)
        setScoreValue(props.value.score)
        setDateValue(props.value.date)
    }, [props]);

    /**
     * The function validates various input values and returns true if they are valid, and false if
     * they are not.
     * @returns a boolean value (either true or false) depending on whether all the validation checks
     * pass or not.
     */
    function validateMatch(){
        if (!/^[0-9]{1,2}-[0-9]{1,2}$/.test(scoreValue)){
            ToasterError("Incorrect/Impossible Score!");
            return false;
        }
        if (club1Value === club2Value){
            ToasterError("The team cannot play with itself!");
            return false;
        }
        if (!/^[0-9]+$/.test(club1Value) && (props.value.club1.id === null || props.value.club1.id === undefined)){
            ToasterError("Invalid club1 id");
            return false;
        }
        if (!/^[0-9]+$/.test(club2Value) && (props.value.club2.id === null || props.value.club2.id === undefined)){
            ToasterError("Invalid club2 id");
            return false;
        }
        if (!/^[0-9]+$/.test(compValue) && (props.value.competition.id === null || props.value.competition.id === undefined)){
            ToasterError("Invalid competition id");
            return false;
        }
        if (!/^[0-9]+$/.test(stadiumValue) && (props.value.stadium.id === null || props.value.stadium.id === undefined)){
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

    /**
     * This function sends a POST request with data to a specified URL and displays error messages if
     * necessary.
     * @returns If the `validateMatch()` function returns `false`, the function will return without
     * executing the rest of the code. Otherwise, the function will make a POST request to the
     * specified URL with the provided request options and handle the response accordingly.
     */
    const postButtonHandler = () => {
        if (!validateMatch())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "club1": club1Value,
                "club2": club2Value,
                "competition": compValue,
                "stadium": stadiumValue,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE + "/api/matches/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.club1 !== undefined)
                    ToasterError(message.club1[0]);
                else if (message.club2 !== undefined)
                    ToasterError(message.club2[0]);
                else if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.competition !== undefined)
                    ToasterError(message.competition[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else if (message.user !== undefined)
                    ToasterError(message.user);
                else
                    props.refresh();
            })
    }

    /**
     * This is a JavaScript function that handles the PUT request for updating a match, with validation
     * checks and error handling.
     * @returns nothing (undefined) in most cases, except when one of the error conditions is met, in
     * which case it returns early and does not execute the rest of the code block.
     */
    const putButtonHandler = () => {
        if (!validateMatch())
            return;
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        if (user.role === "Regular" && user.user_id !== props.value.user.id){
            ToasterError("It's not your Match!");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
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

        const URL = URL_BASE + "/api/matches/" + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.club1 !== undefined)
                    ToasterError(message.club1[0]);
                else if (message.club2 !== undefined)
                    ToasterError(message.club2[0]);
                else if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.competition !== undefined)
                    ToasterError(message.competition[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else if (message.user !== undefined)
                    ToasterError(message.user);
                else
                    props.refresh();
            })
    }

    /**
     * This function handles the deletion of an item by sending a DELETE request to a specified URL and
     * refreshing the page afterwards.
     * @returns If the `props.value.id` is less than 0, the function returns after displaying an error
     * message using the `ToasterError` function. If the `props.value.id` is greater than or equal to
     * 0, the function sends a DELETE request to the specified URL using the `fetch` function and then
     * calls the `props.refresh()` function. However, the function does not explicitly return
     */
    const deleteButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) }
        };

        const URL = URL_BASE + "/api/matches/" + String(props.value.id)

        fetch(URL, requestOptions)
            .then(() => props.refresh());
    }

    /**
     * The predictHandler function sends a POST request to an API endpoint with specific data and
     * displays the predicted score returned by the API.
     */
    const predictHandler = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "club1": club1Value,
                "club2": club2Value,
                "competition": compValue,
                "stadium": stadiumValue,
                "roundOfPlay": roundValue
            })
        };

        fetch(URL_BASE + "/api/predict/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                ToasterError("The predicted score for the match is: " + message.score)
            })
    }

    /* The above code is rendering a form with several input fields for a stadium event. It also
    includes buttons for predicting, posting, updating, and deleting the event. The visibility of
    these buttons is dependent on the user's role (Regular, Moderator, or Admin). */
    return (
        <form className="stadiumForm">
            <Grid container id='inputHolder'>
                <TextField variant="outlined" id="club1" value={club1Value} label="Club1" onChange={(e) => {setClub1Value(e.target.value)}}>Club1</TextField>
                <TextField variant="outlined" id="club2" value={club2Value} label="Club2" onChange={(e) => {setClub2Value(e.target.value)}}>Club2</TextField>
                <TextField variant="outlined" id="comp" value={compValue} label="Competition" onChange={(e) => {setCompValue(e.target.value)}}>Competition</TextField>
                <TextField variant="outlined" id="stadium" value={stadiumValue} label="Stadium" onChange={(e) => {setStadiumValue(e.target.value)}}>Stadium</TextField>
                <TextField variant="outlined" id="round" value={roundValue} label="Round Of Play" onChange={(e) => {setRoundValue(e.target.value)}}>Round Of Play</TextField>
                <TextField variant="outlined" id="score" value={scoreValue} label="Score" onChange={(e) => {setScoreValue(e.target.value)}}
                >Score</TextField>
                <TextField variant="outlined" id="date" value={dateValue} label="Date" onChange={(e) => {setDateValue(e.target.value)}}
                >Date</TextField>
            </Grid>
            {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
            <>
            <h5 id="PredictInstruction">Predicting a match requires the input of club1, club2, competition, stadium and roundOfPlay</h5>
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <Button variant="contained" onClick={predictHandler}>Predict</Button>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                {((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button> : null }
            </Grid></> : null : null }
        </form>
    );
}