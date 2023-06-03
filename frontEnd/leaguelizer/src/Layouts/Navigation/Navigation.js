import React, { useContext} from 'react'
import { Button } from '@mui/material'
import { Link } from "react-router-dom"
import authContext from '../../Context/Context';
import "./Navigation.css"

// Universal navigation menu, for all components, which require one
function Navigation() {
    let {user, setUserLookup} = useContext(authContext);

    return (
        <>
            <div id='navHolder'>
                <div id='homeHolder'>
                    <Link to="/"><Button variant='text' sx={{width:"50%"}}>Home</Button></Link>
                </div>
                <div id='linksHolder'>
                    <Link to="/stadium"><Button variant='text' id="stadiumNavButton">Stadium</Button></Link>
                    <Link to="/club"><Button variant='text' id="clubNavButton">Club</Button></Link>
                    <Link to="/competition"><Button variant='text' id="competitionNavButton">Competition</Button></Link>
                    <Link to="/matches"><Button variant='text' id="matchNavButton">Matches</Button></Link>
                    <Link to="/statistics"><Button variant='text' id="statisticsNavButton">Statistics</Button></Link>
                    <Link to="/chat"><Button variant='text' id="chatNavButton">Chat</Button></Link>
                    {(user && user.role === "Admin") ?
                        <Link to="/admin"><Button variant='text' id="adminNavButton">AdminPage</Button></Link> : null
                    }
                    {user ? 
                        <>
                            <Link to="/user"><Button variant='text' onClick={() => setUserLookup(user.user_id)} id="personalNavButton">PersonalPage</Button></Link> 
                            <Link to="/logout"><Button variant='text' id="logoutNavButton">Logout</Button></Link>
                        </> :
                        <>
                            <Link to="/login"><Button variant='text' id="loginNavButton">Login</Button></Link>
                            <Link to="/register"><Button variant='text' id="registerNavButton">Register</Button></Link>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Navigation