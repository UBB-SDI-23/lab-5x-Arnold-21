import React, {useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button } from '@mui/material'
import authContext from '../../Context/Context'
import { useNavigate } from 'react-router-dom';
import URL_BASE from './constants';

function ActivationPage() {
    let {user} = useContext(authContext);
    let [code, setCode] = useState("");
    let [message, setMessage] = useState(null);
    const navigate = useNavigate()
    
    let activationHandler = async () => {
        let response = await fetch(URL_BASE + "confirm/" + code + "/", {
            method: 'GET',
            headers: {
                'Content-Type':'application/json'
            },
        });
        await response.json();
        if (response.status === 200){
            setMessage("Activation Successfull!")
        } else {
            alert("Activation Failed!");
        }
    }

    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    return (
        <MainLayout>
            <form className="registerForm">
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                    <TextField name="Code" variant="outlined" id="Code" value={code} label="Code" onChange={(e) => { setCode(e.target.value) }}>Code</TextField>
                </Grid>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                    <Button variant="contained" onClick={activationHandler}>Activate</Button>
                </Grid>
                {message ? <h2>Activation successfull!</h2> : <></>}
            </form>
        </MainLayout>
    )
}

export default ActivationPage