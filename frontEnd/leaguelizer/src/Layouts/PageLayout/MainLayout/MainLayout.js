import React from 'react'
import Navigation from '../../Navigation/Navigation' 
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import "./MainLayout.css"

//Main layout for a more cohesive webpage, which incorporates the navigation bar and the toast container
function MainLayout({children}) {
  return (
    <>
        <Navigation></Navigation>
        <div id='main'>
            {children}
        </div>
        <ToastContainer />
    </>
  )
}

export default MainLayout