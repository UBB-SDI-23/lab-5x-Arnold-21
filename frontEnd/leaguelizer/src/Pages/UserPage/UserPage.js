import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, TextField, InputLabel, Select, MenuItem } from '@mui/material';
import authContext from '../../Context/Context';
import URL_BASE from './constants';
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout';
import "./UserPage.css"

// const initialUserDetailValue ={
//     "id":-1,
//     "NumberOfClubs":0,
//     "NumberOfStadiums":0,
//     "NumberOfCompetitions":0,
//     "NumberOfMatches":0,
//     "bio":"",
//     "location":"",
//     "birthday":"",
//     "gender":'O',
//     "marital":'S',
//     "userName":{
//         "id":-1,
//         "username":""
//     }
// }

function UserPage(props) {
    const {userLookup, user} = useContext(authContext);
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
    const [ messageNumber, setMessageNumber ] = useState("");
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);
    let navigate = useNavigate();

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
            setMessageNumber(userLook.userName.numberOfMessages);
        }
    }, [])

    useEffect(() => {
        if (userLookup === -1)
            navigate("/");
        else {
            fetch(URL_BASE + userLookup + "/")
                .then(uesrDetail => uesrDetail.json())
                .then(uesrDetail => fillText(uesrDetail));
        }
    }, [navigate, fillText, userLookup])

    const paginationHandler = (value) => {
        setPaginationValue(value);
        localStorage.setItem('paginationValue', String(value));
    }
    
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
                <TextField variant="outlined" id="messageNumber" value={messageNumber} label="MessageNumber"  aria-readonly>MessageNumber</TextField>
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}} id='genderHolder'>
                    <InputLabel id="genderLabel">Gender</InputLabel>
                    <Select
                        labelId="genderLabel"
                        id="gender"
                        value={gender}
                        label="Gender"
                        sx={{width:"30%"}}
                    >
                        <MenuItem value={'M'}>Male</MenuItem>
                        <MenuItem value={'F'}>Female</MenuItem>
                        <MenuItem value={'O'}>Other</MenuItem>
                    </Select>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}} id='maritalHolder'>
                    <InputLabel id="maritalLabel">Marital Status</InputLabel>
                    <Select
                        labelId="maritalLabel"
                        id="marital"
                        value={marital}
                        label="Marital Status"
                        sx={{width:"30%"}}
                    >
                        <MenuItem value={'M'}>Married</MenuItem>
                        <MenuItem value={'R'}>Relationship</MenuItem>
                        <MenuItem value={'S'}>Single</MenuItem>
                    </Select>
                </Grid>
                <Grid id='paginationHolder'>
                {
                    (user) ? (user.user_id === userLookup) ? 
                        <Select
                            value={paginationValue}
                            label="12"
                            onChange={(e) => paginationHandler(e.target.value)}
                            sx={{ml:"auto", order:2, mt:3}}
                        >
                            <MenuItem value={12}>12</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={40}>40</MenuItem>
                        </Select> : <></> : <></>
                }
                </Grid>
            </Grid>
        </MainLayout>
    )
}

export default UserPage