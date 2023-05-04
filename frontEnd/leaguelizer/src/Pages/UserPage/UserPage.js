import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, TextField, InputLabel, Select, MenuItem } from '@mui/material';

function UserPage(props) {
    const [ user, ] = useState(props.user);
    const [ bio, setBio ] = useState("");
    const [ location, setLocation ] = useState("");
    const [ birthday, setBirthday ] = useState("");
    const [ gender, setGender ] = useState("");
    const [ marital, setMarital ] = useState("");
    let navigate = useNavigate();

    useEffect(() => {
        if (!user)
            navigate("/");
    }, [navigate, user])

    useEffect(() => {
        if (user !== undefined){
            setBio(user.bio);
            setLocation(user.location);
            setBirthday(user.birthday);
            setGender(user.gender);
            setMarital(user.marital);
        }
    }, [user])
    
    return (
        <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
            <TextField variant="outlined" id="bio" value={bio} label="Bio" sx={{width:"100%"}}>Bio</TextField>
            <TextField variant="outlined" id="location" value={location} label="Location" >Location</TextField>
            <TextField variant="outlined" id="birthday" value={birthday} label="Birthday" >Birthday</TextField>
            <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}}>
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
            <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}}>
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
        </Grid>
    )
}

export default UserPage