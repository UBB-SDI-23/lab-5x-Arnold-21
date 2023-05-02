import { useContext, useState, useEffect, createContext } from "react";
import jwt_decode from "jwt-decode";

const authContext = createContext();
const URL = "http://localhost:8000/api/token/";

export default authContext;

export const AuthProvider = ({children}) => {
    let [ tokens, setTokens ] = useState(localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null);
    let [ user, setUser ] = useState(localStorage.getItem('tokens') ? jwt_decode(JSON.parse(localStorage.getItem('tokens')) .access) : null);

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
            localStorage.setItem('tokens', JSON.stringify(data));
        } else {
            alert("Authentication Failed!");
        }
    }

    let logout = () => {
        localStorage.removeItem('tokens');
        setUser(null);
        setTokens(null);
    }

    let contextData ={
        tokens: tokens,
        user: user,
        login: login,
        logout: logout
    }

    return (
        <authContext.Provider value={contextData}>
            {children}
        </authContext.Provider>
    )
}