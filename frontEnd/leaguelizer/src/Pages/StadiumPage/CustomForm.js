import { React, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import URL_BASE from "./constants";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

export default function CustomForm(props) {
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
        return true;
    }

    const postButtonHandler = () => {
        if (!validateStadium())
            return;

        const requestOptions = {
            method: 'POST',
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
        if (!validateStadium())
            return;

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
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const deleteButtonHandler = () => {
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