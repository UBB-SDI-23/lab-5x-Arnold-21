import React, { useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button, Select, InputLabel, MenuItem } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import authContext from '../../Context/Context';
import ToasterError from '../../Layouts/ErrorLayout/ToasterError';
import "./Register.css"

function RegisterPage() {
    /* This code is using React hooks to declare and initialize state variables and a navigation
    function. */
    let {user, URL_BASE} = useContext(authContext);
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [email, setEmail] = useState("");
    let [bio, setBio] = useState("");
    let [location, setLocation] = useState("");
    let [birthday, setBirthday] = useState("2000-01-01");
    let [gender, setGender] = useState("O");
    let [marital, setMarital] = useState("S");
    const navigate = useNavigate()

    /**
     * The function validates user input for a registration form.
     * @returns a boolean value (true or false) depending on whether the input values pass the
     * validation checks or not.
     */
    function validateRegister() {
        if (!/^[a-zA-Z0-9 ]+$/.test(username)){
            ToasterError("Username can only contain numbers and letters");
            return false;
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[.,$+\\]/.test(password)){
            ToasterError("Password isn't strong enough! (special characters allowed: .,$+\\)");
            return false;
        }
        if (password.length < 8){
            ToasterError("Password must be at least 8 characters");
            return false;
        }
        if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
            ToasterError("Invalid email!");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(bio)){
            ToasterError("Bio can only contain numbers and letters");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(location)){
            ToasterError("Location can only contain numbers and letters");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(birthday)){
            ToasterError("Birthday needs to have the following format: yyyy-mm-dd");
            return false;
        }
        if (gender !== 'O' && gender !== 'M' && gender !== 'F'){
            ToasterError("Invalid gender");
            return false;
        }
        if (marital !== 'M' && marital !== 'S' && marital !== 'R'){
            ToasterError("Invalid marital");
            return false;
        }
        return true;
    }
    
    /**
     * The function sends a POST request to register a user and navigates to the activation page if
     * successful.
     * @returns The function `registerHandler` is returning nothing (`undefined`). It is using the
     * `return` statement only to exit the function early if the `validateRegister()` function returns
     * false.
     */
    let registerHandler = async () => {
        if (!validateRegister())
            return;

        let response = await fetch(URL_BASE + "/api/register/", {
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
            ToasterError("Registration Failed!");
        }
    }

    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    /* The `return` statement is returning a JSX code block that renders a registration form with
    various input fields such as username, password, email, bio, location, birthday, gender, and
    marital status. The form also includes a "Register" button that triggers the `registerHandler`
    function when clicked. The form is wrapped in a `MainLayout` component that provides a
    consistent layout and styling across the application. */
    return (
        <MainLayout>
            <form className="registerForm">
                <Grid container id='inputHolder'>
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
                        >
                            <MenuItem value={'M'}>Married</MenuItem>
                            <MenuItem value={'R'}>Relationship</MenuItem>
                            <MenuItem value={'S'}>Single</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5, mb:20 }}>
                    <Button variant="contained" onClick={registerHandler} id='registerBtn'>Register</Button>
                </Grid>
            </form>
        </MainLayout>
    )
}

export default RegisterPage