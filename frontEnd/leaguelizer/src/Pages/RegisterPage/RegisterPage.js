import React, { useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button, Select, InputLabel, MenuItem } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import authContext from '../../Context/Context';
import URL_BASE from './constants';

function RegisterPage() {
    let {user} = useContext(authContext);
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [email, setEmail] = useState("");
    let [bio, setBio] = useState("");
    let [location, setLocation] = useState("");
    let [birthday, setBirthday] = useState("2000-01-01");
    let [gender, setGender] = useState("O");
    let [marital, setMarital] = useState("S");
    const navigate = useNavigate()
    
    let registerHandler = async () => {
        let response = await fetch(URL_BASE, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                'username':username, 
                'password':password,
                'email':email,
                'bio':bio,
                'location':location,
                'day':birthday,
                'gender':gender,
                'marital':marital
            })
        });
        await response.json();
        if (response.status === 200){
            navigate("/activation");
        } else {
            alert("registration Failed!");
        }
    }

    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    return (
        <MainLayout>
            <form className="registerForm">
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                    <TextField name="username" variant="outlined" id="username" value={username} label="Username" onChange={(e) => { setUsername(e.target.value) }}>Username</TextField>
                    <TextField type="password" name="password" variant="outlined" id="password" value={password} label="Password" onChange={(e) => { setPassword(e.target.value) }}>Password</TextField>
                    <TextField name="email" variant="outlined" id="email" value={email} label="Email" onChange={(e) => { setEmail(e.target.value) }}>Email</TextField>
                    <TextField name="bio" variant="outlined" id="bio" value={bio} label="Bio" onChange={(e) => { setBio(e.target.value) }} sx={{width:"100%", mt:3}}>Bio</TextField>
                    <TextField name="location" variant="outlined" id="location" value={location} label="Location" onChange={(e) => { setLocation(e.target.value) }} sx={{width:"100%", mt:3}}>Location</TextField>
                    <TextField name="birthday" variant="outlined" id="birthday" value={birthday} label="Birthday" onChange={(e) => { setBirthday(e.target.value) }} sx={{width:"100%", mt:3}}>Birthday</TextField>
                    <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", pt: 5}}>
                        <InputLabel id="genderLabel">Gender</InputLabel>
                        <Select
                            labelId="genderLabel"
                            id="gender"
                            value={gender}
                            label="Gender"
                            onChange={(e) => setGender(e.target.value)}
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
                            onChange={(e) => setMarital(e.target.value)}
                            sx={{width:"30%"}}
                        >
                            <MenuItem value={'M'}>Married</MenuItem>
                            <MenuItem value={'R'}>Relationship</MenuItem>
                            <MenuItem value={'S'}>Single</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                    <Button variant="contained" onClick={registerHandler}>Register</Button>
                </Grid>
            </form>
        </MainLayout>
    )
}

export default RegisterPage