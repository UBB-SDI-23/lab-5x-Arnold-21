import React, {useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button } from '@mui/material'
import authContext from '../../Context/Context'
import { useNavigate } from 'react-router-dom';
import ToasterError from '../../Layouts/ErrorLayout/ToasterError';

//Login page, which uses the context for login handling
function LoginPage() {
    //Getting the neccessary variables and functions from the context
    let {user,login} = useContext(authContext);
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    const navigate = useNavigate()

    //Login handler function, which first checks the username constraints, than calls the login function of the context
    let loginHandler = () => {
        //Check simple username constraint with regex, for sake of simplicity
        if (!/^[a-zA-Z0-9 ]+$/.test(username)){
            ToasterError("Username can only contain numbers and letters");
            return;
        }

        //Login and renavigation
        login(username, password);
        if (localStorage.getItem('tokens')){
            navigate("/");
        }
    }


    /* `useEffect` is a hook in React that allows you to perform side effects in function components.
    In this case, the `useEffect` hook is used to check if the `user` variable has a value (i.e.,
    the user is logged in) and if so, it navigates to the home page using the `navigate` function
    from the `react-router-dom` library. The `useEffect` hook is triggered whenever the `user` or
    `navigate` variables change. */
    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    /* This is the JSX code that defines the layout of the login page. It includes a form with two text
    fields for the username and password, and a button to submit the login information. The form is
    wrapped in a `MainLayout` component, which provides a consistent layout for all pages in the
    application. The `sx` prop is used to apply styling to the components using the Material UI
    library. The `onChange` prop is used to update the state variables `username` and `password`
    whenever the user types in the text fields. The `onClick` prop is used to call the
    `loginHandler` function when the user clicks the login button. */
    return (
        <MainLayout>
            <form className="registerForm">
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5 }}>
                    <TextField name="username" variant="outlined" id="username" value={username} label="Username" onChange={(e) => { setUsername(e.target.value) }} sx={{mt:5}}>Username</TextField>
                    <TextField type="password" name="password" variant="outlined" id="password" value={password} label="Password" onChange={(e) => { setPassword(e.target.value) }} sx={{mt:5}}>Password</TextField>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5 }}>
                    <Button variant="contained" onClick={loginHandler} id='loginButton'>Post</Button>
                </Grid>
            </form>
        </MainLayout>
    )
}

export default LoginPage