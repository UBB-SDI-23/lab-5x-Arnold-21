import { React, useContext, useEffect, useState } from "react";
import { Button, Grid, TextField, InputLabel, Select, MenuItem } from "@mui/material";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";
import "./Form.css"

export default function CustomForm(props) {
    /* This code is using React hooks to declare and initialize state variables for the component. */
    let {user, tokens, URL_BASE} = useContext(authContext);
    const [userName, setUserName] = useState(props.value.username);
    const [userRole, setUserRole] = useState(props.value.role);
    const [paginationValue, setPaginationValue] = useState(12)

    /* `useEffect(() => {...})` is a React hook that is used to perform side effects in functional
    components. In this case, it is used to update the state variables `userName` and `userRole`
    whenever the `props` object changes. The second argument `[props]` is an array of dependencies
    that tells React when to re-run the effect. In this case, the effect will run whenever the
    `props` object changes. */
    useEffect(() => {
        setUserName(props.value.username)
        setUserRole(props.value.role)
    }, [props]);

    /**
     * The function validates if the user role is either "Admin", "Moderator", or "Regular".
     * @returns The function `validateUser()` returns a boolean value (`true` or `false`). If the
     * `userRole` is not equal to "Admin", "Moderator", or "Regular", the function returns `false`.
     * Otherwise, it returns `true`.
     */
    function validateUser() {
        if (userRole !== "Admin" && userRole !== "Moderator" && userRole !== "Regular"){
            ToasterError("Incorrect User Role!");
            return false;
        }
        return true;
    }

   /**
    * This function sends a PUT request to update a user's role and displays an error message if the
    * user ID is not a positive integer.
    * @returns The function `putButtonHandler` returns nothing (`undefined`) in most cases, except when
    * the validation fails for the user ID being a positive integer, in which case it returns early and
    * does not execute the rest of the function.
    */
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

        const URL = URL_BASE + "/api/admin/user/" + String(props.value.id) + "/"

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
     * This function sends a PUT request to update the pagination value for a user detail page.
     * @returns The function `putPaginationHandler` returns nothing (`undefined`) in most cases, except
     * when an error message is displayed or the `props.refresh()` function is called.
     */
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

        const URL = URL_BASE + "/api/admin/userdetail/" + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

   /* This code is returning a form component that contains three input fields: a read-only text field
   for the user's username, a dropdown menu for selecting the user's role, and another dropdown menu
   for selecting the pagination value. If the logged-in user is an admin, two buttons are also
   displayed at the bottom of the form: one for updating the user's role and another for updating
   the pagination value. The `putButtonHandler` and `putPaginationHandler` functions are called when
   the respective buttons are clicked, which send PUT requests to update the user's role and
   pagination value, respectively. */
    return (
        <form className="stadiumForm">
            <Grid container id='inputHolder'>
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