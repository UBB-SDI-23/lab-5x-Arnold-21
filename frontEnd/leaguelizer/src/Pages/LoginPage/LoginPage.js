import React, {useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button } from '@mui/material'
import authContext from '../../Context/Context'
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    let {user,login} = useContext(authContext);
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    const navigate = useNavigate()
    
    let loginHandler = () => {
        login(username, password);
        navigate("/");
    }

    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    return (
        <MainLayout>
            <form className="registerForm">
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                    <TextField name="username" variant="outlined" id="username" value={username} label="Username" onChange={(e) => { setUsername(e.target.value) }}>Username</TextField>
                    <TextField type="password" name="password" variant="outlined" id="password" value={password} label="Password" onChange={(e) => { setPassword(e.target.value) }}>Password</TextField>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                    <Button variant="contained" onClick={loginHandler}>Post</Button>
                </Grid>
            </form>
        </MainLayout>
    )
}

export default LoginPage