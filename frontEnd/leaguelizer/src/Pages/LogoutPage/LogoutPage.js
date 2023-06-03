import React, {useContext, useEffect} from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Container, Grid, Button } from '@mui/material'
import authContext from '../../Context/Context'
import { useNavigate } from 'react-router-dom';

//Logout page, only shows one button, which uses the logout function from the context
function LogoutPage() {
    //Getting the neccessary variables and functions from the context of the application
    let {user,logout} = useContext(authContext);
    const navigate = useNavigate()
    
    let logoutHandler = () => {
        logout();
        navigate("/login");
    }

    //Checking if the user is logged in, if not renavigate the user to the main page
    useEffect(() => {
        if (!user)
            navigate("/");
    }, [user, navigate])

    //Since there aren't many elements, the styling is done incode, for more convinience
    return (
        <MainLayout>
            <Container sx={{display:"flex", justifyContent:"space-evenly", alignContent:"center"}}>
                <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5, mt:10 }}>
                    <Button variant="contained" onClick={logoutHandler} id='logoutBtn' sx={{height:75, width:150}}>Logout</Button>
                </Grid>
            </Container>
        </MainLayout>
    )
}

export default LogoutPage