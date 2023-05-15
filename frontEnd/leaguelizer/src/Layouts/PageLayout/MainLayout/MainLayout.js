import React from 'react'
import Navigation from '../../Navigation/Navigation' 
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import "./MainLayout.css"

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