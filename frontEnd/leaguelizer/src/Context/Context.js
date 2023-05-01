import { useContext, useState, useEffect, createContext } from "react";
import jwt_decode from "jwt-decode";

const authContext = createContext();
const URL = "http://localhost:8000/api/token/";

export default authContext;

export const AuthProvider = ({children}) => {
    let [ tokens, setTokens ] = useState(null);
    let [ user, setUser ] = useState(null);

    let login = async (username, password) => {
        let response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'username':username, 'password':password})
        });
        let data = await response.json();
        if (response.status === 200){
            setTokens(data);
            setUser(jwt_decode(data.access));
        } else {
            alert("Authentication Failed!");
        }
    }

    let contextData ={
        tokens: tokens,
        user: user,
        login: login
    }

    return (
        <authContext.Provider value={contextData}>
            {children}
        </authContext.Provider>
    )
}