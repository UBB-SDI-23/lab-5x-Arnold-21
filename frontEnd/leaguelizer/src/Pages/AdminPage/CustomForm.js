import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import URL_BASE from "./constants";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";

export default function CustomForm(props) {
    let {user, tokens} = useContext(authContext);
    const [userName, setUserName] = useState(props.value.username);
    const [userRole, setUserRole] = useState(props.value.role);

    useEffect(() => {
        setUserName(props.value.username)
        setUserRole(props.value.role)
    }, [props]);

    function validateUser() {
        if (userRole !== "Admin" && userRole !== "Moderator" && userRole !== "Regular"){
            ToasterError("Incorrect User Role!");
            return false;
        }
        return true;
    }

    const putButtonHandler = () => {
        if (!validateUser())
            return;
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "role": userRole
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

    return (
        <form className="stadiumForm">
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <TextField variant="outlined" id="username" value={userName} label="UserName" aria-readonly>UserName</TextField>
                <TextField variant="outlined" id="role" value={userRole} label="UserRole" onChange={(e) => {setUserRole(e.target.value)}}>UserRole</TextField>
            </Grid>
            {(user !== null) ? (user.role === "Admin") ?
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                    <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                </Grid> : null : null
            }
        </form>
    );
}