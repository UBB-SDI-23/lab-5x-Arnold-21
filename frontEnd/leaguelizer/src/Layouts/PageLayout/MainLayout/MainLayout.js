import React from 'react'
import Navigation from '../../Navigation/Navigation' 
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

function MainLayout({children}) {
  return (
    <>
        <Navigation></Navigation>
        <div style={{marginLeft:"10vw", marginRight:"10vw"}}>
            {children}
        </div>
        <ToastContainer />
    </>
  )
}

export default MainLayout