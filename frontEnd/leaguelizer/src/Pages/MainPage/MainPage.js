import React from 'react'
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout'
import { Container } from '@mui/material'

function MainPage() {
  return (
    <MainLayout>
        <Container sx={{display:"flex", justifyContent:"center", alignContent:"center"}}>
            <h1 style={{marginTop:"100px"}}
            >Welcome To Your Fantasy Football League</h1>
        </Container>
    </MainLayout>
  )
}

export default MainPage