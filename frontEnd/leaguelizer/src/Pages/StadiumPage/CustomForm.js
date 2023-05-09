import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import URL_BASE from "./constants";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";

export default function CustomForm(props) {
    let {user} = useContext(authContext);
    const [stadiumNameValue, setStadiumNameValue] = useState(props.value.name);
    const [stadiumBDateValue, setStadiumBDateValue] = useState(props.value.buildDate);
    const [stadiumRDateValue, setStadiumRDateValue] = useState(props.value.renovationDate);
    const [stadiumCityValue, setStadiumCityValue] = useState(props.value.city);
    const [stadiumCapacityValue, setStadiumCapacityValue] = useState(props.value.capacity);
    const [stadiumDescription, setStadiumDescription] = useState(props.value.description);

    useEffect(() => {
        setStadiumNameValue(props.value.name)
        setStadiumBDateValue(props.value.buildDate)
        setStadiumRDateValue(props.value.renovationDate)
        setStadiumCityValue(props.value.city)
        setStadiumCapacityValue(props.value.capacity)
        setStadiumDescription(props.value.description)
    }, [props]);

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

    const postButtonHandler = () => {
        if (!validateStadium())
            return;

        console.log((user) ? user.user_id : null)

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        fetch(URL_BASE, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    const putButtonHandler = () => {
        if (!validateStadium())
            return;
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": stadiumNameValue,
                "city": stadiumCityValue,
                "capacity": stadiumCapacityValue,
                "buildDate": stadiumBDateValue,
                "renovationDate": stadiumRDateValue,
                "description": stadiumDescription
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
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
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        const URL = URL_BASE + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(() => {props.refresh();});
    }

    return (
        <form className="stadiumForm">
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <TextField variant="outlined" id="name" value={stadiumNameValue} label="Stadium Name" onChange={(e) => {setStadiumNameValue(e.target.value)}}>StadiumName</TextField>
                <TextField variant="outlined" id="bDate" value={stadiumBDateValue} label="Build Date" onChange={(e) => {setStadiumBDateValue(e.target.value)}}>Build Date</TextField>
                <TextField variant="outlined" id="rDate" value={stadiumRDateValue} label="Renovation Date" onChange={(e) => {setStadiumRDateValue(e.target.value)}}>Renovation Date</TextField>
                <TextField variant="outlined" id="city" value={stadiumCityValue} label="City" onChange={(e) => {setStadiumCityValue(e.target.value)}}>City</TextField>
                <TextField variant="outlined" id="capacity" value={stadiumCapacityValue} label="Capacity" onChange={(e) => {setStadiumCapacityValue(e.target.value)}}>Capacity</TextField>
                <TextField variant="outlined" id="description" value={stadiumDescription} label="Description" onChange={(e) => {setStadiumDescription(e.target.value)}}
                    sx={{width:"100%", mt:3}}
                >Description</TextField>
            </Grid>
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button>
            </Grid>
        </form>
    );
}