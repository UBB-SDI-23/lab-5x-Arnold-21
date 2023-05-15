import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField, InputLabel, Select, MenuItem } from "@mui/material";
import URL_BASE from "./constants";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";

export default function CustomForm(props) {
    let {user, tokens} = useContext(authContext);
    const [userName, setUserName] = useState(props.value.username);
    const [userRole, setUserRole] = useState(props.value.role);
    const [paginationValue, setPaginationValue] = useState(12)

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

    const putPaginationHandler = () => {
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
                "paginationValue": paginationValue
            })
        };

        const URL = "https://SArnold-sdi-22-23.mooo.com/api/admin/userdetail/" + String(props.value.id) + "/"

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
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}}>
                    <InputLabel id="roleLabel">Role Status</InputLabel>
                    <Select
                        labelId="maritalLabel"
                        id="role"
                        value={userRole}
                        label="User Role"
                        onChange={(e) => setUserRole(e.target.value)}
                        sx={{width:"30%"}}
                    >
                        <MenuItem value={'Admin'}>Admin</MenuItem>
                        <MenuItem value={'Moderator'}>Moderator</MenuItem>
                        <MenuItem value={'Regular'}>Regular</MenuItem>
                    </Select>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}}>
                    <InputLabel id="paginationLabel">Pagination Label</InputLabel>
                    <Select
                        labelId="paginationLabel"
                        id="pagination"
                        value={paginationValue}
                        label="User Role"
                        onChange={(e) => setPaginationValue(e.target.value)}
                        sx={{width:"30%"}}
                    >
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            {(user !== null) ? (user.role === "Admin") ?
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                    <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                    <Button variant="contained" onClick={putPaginationHandler}>PutPagination</Button>
                </Grid> : null : null
            }
        </form>
    );
}