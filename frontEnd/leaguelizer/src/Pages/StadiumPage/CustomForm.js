import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";
import "./Form.css"

export default function CustomForm(props) {
    /* This code is using the `useContext` and `useState` hooks from React to access and update state
    variables and context variables. */
    let {user, tokens, URL_BASE} = useContext(authContext);
    const [stadiumNameValue, setStadiumNameValue] = useState(props.value.name);
    const [stadiumBDateValue, setStadiumBDateValue] = useState(props.value.buildDate);
    const [stadiumRDateValue, setStadiumRDateValue] = useState(props.value.renovationDate);
    const [stadiumCityValue, setStadiumCityValue] = useState(props.value.city);
    const [stadiumCapacityValue, setStadiumCapacityValue] = useState(props.value.capacity);
    const [stadiumDescription, setStadiumDescription] = useState(props.value.description);

    //Whenever the form is refreshed, the fields are also refreshed
    useEffect(() => {
        setStadiumNameValue(props.value.name)
        setStadiumBDateValue(props.value.buildDate)
        setStadiumRDateValue(props.value.renovationDate)
        setStadiumCityValue(props.value.city)
        setStadiumCapacityValue(props.value.capacity)
        setStadiumDescription(props.value.description)
    }, [props]);

    /**
     * The function validates various input fields related to a stadium and returns true if all inputs
     * are valid.
     * @returns a boolean value (either true or false) depending on whether all the validation checks
     * pass or not.
     */
    function validateStadium() {
        if (!/^[0-9]+$/.test(stadiumCapacityValue) | parseInt(stadiumCapacityValue) < 0){
            ToasterError("Stadium capacity must be positive");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(stadiumBDateValue)){
            ToasterError("Build Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(stadiumRDateValue)){
            ToasterError("Renovation Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(stadiumNameValue)){
            ToasterError("Stadium Name can only contain numbers and letters");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(stadiumCityValue)){
            ToasterError("Stadium City can only contain numbers and letters");
            return false;
        }
        if (!/^[a-zA-Z0-9 .,!?;:]+$/.test(stadiumDescription)){
            ToasterError("Stadium Description can only contain numbers and letters");
            return false;
        }
        return true;
    }

    /**
     * This function sends a POST request to a server with stadium information and refreshes the page
     * if successful.
     * @returns The function `postButtonHandler` is returning nothing (`undefined`). It is using a
     * `return` statement to exit the function early if the `validateStadium()` function returns false,
     * but it is not returning any value.
     */
    const postButtonHandler = () => {
        if (!validateStadium())
            return;

        console.log((user) ? user.user_id : null)

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "name": stadiumNameValue,
                "city": stadiumCityValue,
                "capacity": stadiumCapacityValue,
                "buildDate": stadiumBDateValue,
                "renovationDate": stadiumRDateValue,
                "description": stadiumDescription,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE + "/api/stadiums/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    /**
     * This is a function that handles the PUT request to update a stadium's information.
     * @returns The function `putButtonHandler` returns nothing (`undefined`). It either returns early
     * with a `return` statement if certain conditions are not met, or it executes a `fetch` request
     * and then either displays an error message or calls the `refresh` function passed as a prop.
     */
    const putButtonHandler = () => {
        if (!validateStadium())
            return;
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        if (user.role === "Regular" && user.user_id !== props.value.user.id){
            ToasterError("It's not your Stadium!");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "name": stadiumNameValue,
                "city": stadiumCityValue,
                "capacity": stadiumCapacityValue,
                "buildDate": stadiumBDateValue,
                "renovationDate": stadiumRDateValue,
                "description": stadiumDescription
            })
        };

        const URL = URL_BASE + "/api/stadiums/" + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    /**
     * This function handles the deletion of a stadium object from a server using a DELETE request and
     * displays an error message if the ID is not a positive integer.
     * @returns The function `deleteButtonHandler` is returning nothing (`undefined`). It is only
     * executing some code to handle the deletion of a stadium and refresh the component.
     */
    const deleteButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        };

        const URL = URL_BASE + "/api/stadiums/" + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(() => {props.refresh();});
    }

    /* This is a JSX code block that defines the structure and layout of a form component. It includes
    several `TextField` components for inputting stadium information, as well as conditional
    rendering of buttons based on the user's role and whether they are logged in or not. The
    `Button` components have `onClick` handlers that call functions to handle POST, PUT, and DELETE
    requests to a server. The form is wrapped in a `Grid` container for layout purposes. */
    return (
        <form className="stadiumForm">
            <Grid container id="inputHolder">
                <TextField variant="outlined" id="name" value={stadiumNameValue} label="Stadium Name" onChange={(e) => {setStadiumNameValue(e.target.value)}}>StadiumName</TextField>
                <TextField variant="outlined" id="bDate" value={stadiumBDateValue} label="Build Date" onChange={(e) => {setStadiumBDateValue(e.target.value)}}>Build Date</TextField>
                <TextField variant="outlined" id="rDate" value={stadiumRDateValue} label="Renovation Date" onChange={(e) => {setStadiumRDateValue(e.target.value)}}>Renovation Date</TextField>
                <TextField variant="outlined" id="city" value={stadiumCityValue} label="City" onChange={(e) => {setStadiumCityValue(e.target.value)}}>City</TextField>
                <TextField variant="outlined" id="capacity" value={stadiumCapacityValue} label="Capacity" onChange={(e) => {setStadiumCapacityValue(e.target.value)}}>Capacity</TextField>
                <TextField variant="outlined" id="description" value={stadiumDescription} label="Description" onChange={(e) => {setStadiumDescription(e.target.value)}}
                    sx={{width:"100%", mt:3}}
                >Description</TextField>
            </Grid>
            {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                    <Button variant="contained" onClick={postButtonHandler} id="stadiumPostBtn">Post</Button>
                    <Button variant="contained" onClick={putButtonHandler} id="stadiumPUTBtn">Put</Button>
                    {((user.role === "Moderator" || user.role === "Admin")) ?
                    <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler} id="stadiumDeleteBtn">Delete</Button> : null }
                </Grid> : null : null
            }
        </form>
    );
}