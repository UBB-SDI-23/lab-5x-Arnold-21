import React, {useContext, useState, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Grid, TextField, Button } from '@mui/material'
import authContext from '../../Context/Context'
import { useNavigate } from 'react-router-dom';
import ToasterError from '../../Layouts/ErrorLayout/ToasterError';

//Activation page, which is only available after register, to activate the new user account
function ActivationPage() {
    /* These lines of code are defining variables and state hooks for the ActivationPage component. */
    let {user, URL_BASE} = useContext(authContext);
    let [code, setCode] = useState("");
    let [message, setMessage] = useState(null);
    const navigate = useNavigate()
    
   /**
    * The function handles the activation process by sending a GET request to a specified URL with a
    * code parameter and displaying a success or failure message based on the response status.
    * @returns The function `activationHandler` does not return anything explicitly. It performs some
    * asynchronous operations and updates the UI by setting the message or displaying an error message
    * using the `ToasterError` function.
    */
    let activationHandler = async () => {
        if (!/^[0-9]+$/.test(code)){
            ToasterError("Invalid code");
            return;
        }

        let response = await fetch(URL_BASE + "/api/register/confirm/" + code + "/", {
            method: 'GET',
            headers: {
                'Content-Type':'application/json'
            },
        });
        await response.json();
        if (response.status === 200){
            setMessage("Activation Successfull!")
        } else {
            ToasterError("Activation Failed!");
        }
    }

    useEffect(() => {
        if (user)
            navigate("/");
    }, [user, navigate])

    /* The `return` statement is returning a JSX element that represents the UI of the `ActivationPage`
    component. */
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