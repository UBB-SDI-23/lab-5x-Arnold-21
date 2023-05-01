import React from 'react'
import { Button } from '@mui/material'
import { Link } from "react-router-dom"

function Navigation() {
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
                <Link to="/login"><Button variant='text'>Login</Button></Link>
            </div>
        </div>
    )
}

export default Navigation