import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, TextField, InputLabel, Select, MenuItem } from '@mui/material';
import authContext from '../../Context/Context';
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout';
import "./UserPage.css"

function UserPage(props) {
    /* This code is defining a functional component called `UserPage` that imports several modules from
    the `react` and `@mui/material` libraries. It also imports a context called `authContext` that
    contains information about the user and the base URL for API calls. */
    const {userLookup, user, URL_BASE} = useContext(authContext);
    const [ bio, setBio ] = useState("");
    const [ location, setLocation ] = useState("");
    const [ birthday, setBirthday ] = useState("");
    const [ gender, setGender ] = useState("O");
    const [ marital, setMarital ] = useState("S");
    const [ numberOfStadiums, setNumberOfStadiums ] = useState(0);
    const [ numberOfClubs, setNumberOfClubs ] = useState(0);
    const [ numberOfCompetitions, setNumberOfCompetitions ] = useState(0);
    const [ numberOfMatches, setNumberOfMatches ] = useState(0);
    const [ userName, setUserName ] = useState("");
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);
    let navigate = useNavigate();

    //The fillText function called by the function that get's the personal information of the user from the backend
    //Gets a userLook variable, which is a json with the information, and updates the elements
    const fillText = useCallback((userLook) => {
        if (userLook !== null && userLook !== undefined){
            setBio(userLook.bio);
            setLocation(userLook.location);
            setBirthday(userLook.birthday);
            setGender(userLook.gender);
            setMarital(userLook.marital);
            setNumberOfStadiums(userLook.NumberOfStadiums);
            setNumberOfClubs(userLook.NumberOfClubs);
            setNumberOfCompetitions(userLook.NumberOfCompetitions);
            setNumberOfMatches(userLook.NumberOfMatches);
            setUserName(userLook.userName.username);
        }
    }, [])

    //This function checks, if the user gotten to this webpage normally (the userLookup is not -1, since the navigation changes it to the user id)
    // If it's correct, it gets the personal information, and if not, it renavigates to the main page
    useEffect(() => {
        if (userLookup === -1)
            navigate("/");
        else {
            fetch(URL_BASE + "/api/user/" + userLookup + "/")
                .then(uesrDetail => uesrDetail.json())
                .then(uesrDetail => fillText(uesrDetail));
        }
    }, [navigate, fillText, userLookup, URL_BASE])

    /**
     * The function sets a pagination value and saves it to local storage.
     * @param value - The value parameter is a variable that represents the new pagination value that
     * is being set. It is passed as an argument to the paginationHandler function.
     */
    const paginationHandler = (value) => {
        setPaginationValue(value);
        localStorage.setItem('paginationValue', String(value));
    }
    
    /* The `return` statement is returning a JSX code block that renders a form for displaying and
    editing user information. The form includes several `TextField` components for displaying and
    editing the user's bio, location, birthday, number of stadiums, number of clubs, number of
    competitions, and number of matches. It also includes two `Select` components for displaying and
    editing the user's gender and marital status. Additionally, if the logged-in user is viewing
    their own profile, a `Select` component is rendered for changing the number of items displayed
    per page. The form is wrapped in a `Grid` container and a `MainLayout` component for styling and
    layout purposes. */
    return (
        <MainLayout>
            <Grid container id='inputHolder'>
                <TextField variant="outlined" id="bio" value={userName} label="Username" sx={{width:"100%"}}>Username</TextField>
                <TextField variant="outlined" id="bio" value={bio} label="Bio" sx={{width:"100%", mt:2}}>Bio</TextField>
                <TextField variant="outlined" id="location" value={location} label="Location" >Location</TextField>
                <TextField variant="outlined" id="birthday" value={birthday} label="Birthday" >Birthday</TextField>
                <TextField variant="outlined" id="numberOfStadiums" value={numberOfStadiums} label="NumberOfStadiums"  aria-readonly>NumberOfStadiums</TextField>
                <TextField variant="outlined" id="numberOfClubs" value={numberOfClubs} label="NumberOfClubs"  aria-readonly>NumberOfClubs</TextField>
                <TextField variant="outlined" id="numberOfCompetitions" value={numberOfCompetitions} label="NumberOfCompetitions"  aria-readonly>NumberOfCompetitions</TextField>
                <TextField variant="outlined" id="numberOfMatches" value={numberOfMatches} label="NumberOfMatches"  aria-readonly>NumberOfMatches</TextField>
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}} id='genderHolder'>
                    <InputLabel id="genderLabel">Gender</InputLabel>
                    <Select
                        labelId="genderLabel"
                        id="gender"
                        value={gender}
                        label="Gender"
                        sx={{width:"100%"}}
                    >
                        <MenuItem value={'M'} disabled="true">Male</MenuItem>
                        <MenuItem value={'F'} disabled="true">Female</MenuItem>
                        <MenuItem value={'O'} disabled="true">Other</MenuItem>
                    </Select>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}} id='maritalHolder'>
                    <InputLabel id="maritalLabel">Marital Status</InputLabel>
                    <Select
                        labelId="maritalLabel"
                        id="marital"
                        value={marital}
                        label="Marital Status"
                        sx={{width:"100%"}}
                    >
                        <MenuItem value={'M'} disabled="true">Married</MenuItem>
                        <MenuItem value={'R'} disabled="true">Relationship</MenuItem>
                        <MenuItem value={'S'} disabled="true">Single</MenuItem>
                    </Select>
                </Grid>
                <Grid id='paginationHolder'>
                {
                    (user) ? (user.user_id === userLookup) ? 
                        <>
                            <hr id='lineBreak'></hr><h2>Change the number of items per page</h2>
                            <Select
                                value={paginationValue}
                                label="12"
                                onChange={(e) => paginationHandler(e.target.value)}
                                sx={{ml:"auto", order:2, mt:3}}
                            >
                                <MenuItem value={12}>12</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={40}>40</MenuItem>
                            </Select>
                        </> : <></> : <></>
                }
                </Grid>
            </Grid>
        </MainLayout>
    )
}

export default UserPage