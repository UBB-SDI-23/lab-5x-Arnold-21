import React, { useContext, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { Link } from "react-router-dom"
import authContext from '../../Context/Context';
import "./Navigation.css"

function Navigation() {
    let {user, setUserLookup} = useContext(authContext);
    const [width, setWidth] = useState(window.innerWidth);
    const [direction, setDirection] = useState("row");

    useEffect(() => {
        window.addEventListener("resize", () => setWidth(window.innerWidth))
    }, []);

    useEffect(() => {
        if (width < 750 && direction === "row"){
            setDirection("column");
        }
        else if (width > 750 && direction === "column"){
            setDirection("row");
        }
    }, [width, setDirection, direction])

    return (
        <>
            <div id='navHolder'>
                <div id='homeHolder'>
                    <Link to="/"><Button variant='text' sx={{width:"50%"}}>Home</Button></Link>
                    {direction}
                </div>
                <div id='linksHolder'>
                    <Link to="/stadium"><Button variant='text'>Stadium</Button></Link>
                    <Link to="/club"><Button variant='text'>Club</Button></Link>
                    <Link to="/competition"><Button variant='text'>Competition</Button></Link>
                    <Link to="/matches"><Button variant='text'>Matches</Button></Link>
                    <Link to="/statistics"><Button variant='text'>Statistics</Button></Link>
                    {(user && user.role === "Admin") ?
                        <Link to="/admin"><Button variant='text'>AdminPage</Button></Link> : null
                    }
                    {user ? 
                        <>
                            <Link to="/user"><Button variant='text' onClick={() => setUserLookup(user.user_id)}>PersonalPage</Button></Link> 
                            <Link to="/logout"><Button variant='text'>Logout</Button></Link>
                        </> :
                        <>
                            <Link to="/login"><Button variant='text' id="login">Login</Button></Link>
                            <Link to="/register"><Button variant='text'>Register</Button></Link>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Navigation