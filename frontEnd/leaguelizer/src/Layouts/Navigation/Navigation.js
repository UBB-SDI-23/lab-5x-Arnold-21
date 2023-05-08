import React, { useContext } from 'react'
import { Button } from '@mui/material'
import { Link } from "react-router-dom"
import authContext from '../../Context/Context';

function Navigation() {
    let {user, setUserLookup} = useContext(authContext);

    return (
        <div style={{display:"flex", flexDirection:"row", borderBottom:"2px solid gray", paddingBottom:"10px", paddingTop:"10px", background:"black"}}>
            <div style={{width:"30%"}}>
                <Link to="/"><Button variant='text' sx={{width:"50%"}}>Home</Button></Link>
            </div>
            <div style={{width:"70%", display:"flex", justifyContent:"space-around"}}>
                <Link to="/stadium"><Button variant='text'>Stadium</Button></Link>
                <Link to="/club"><Button variant='text'>Club</Button></Link>
                <Link to="/competition"><Button variant='text'>Competition</Button></Link>
                <Link to="/matches"><Button variant='text'>Matches</Button></Link>
                <Link to="/statistics"><Button variant='text'>Statistics</Button></Link>
                {user ? 
                    <>
                        <Link to="/user"><Button variant='text' onClick={() => setUserLookup(user.user_id)}>PersonalPage</Button></Link> 
                        <Link to="/logout"><Button variant='text'>Logout</Button></Link>
                    </> :
                    <>
                        <Link to="/login"><Button variant='text'>Login</Button></Link>
                        <Link to="/register"><Button variant='text'>Register</Button></Link>
                    </>
                }
            </div>
        </div>
    )
}

export default Navigation