import { useState, useEffect, createContext } from "react";
import jwt_decode from "jwt-decode";
import ToasterError from "../Layouts/ErrorLayout/ToasterError";

const authContext = createContext();
// const URL = "http://localhost:8000/api/token/";
// const URL_DETAIL = "http://localhost:8000/api/user/";
const URL = "https://SArnold-sdi-22-23.crabdance.com/api/token/";
const URL_DETAIL = "https://SArnold-sdi-22-23.crabdance.com/api/user/";


export default authContext;

export const AuthProvider = ({children}) => {
    let [ tokens, setTokens ] = useState(localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null);
    let [ user, setUser ] = useState(localStorage.getItem('tokens') ? jwt_decode(JSON.parse(localStorage.getItem('tokens')).access) : null);
    let [ userLookup, setUserLookup ] = useState(-1);
    let [ loading, setLoading ] = useState((!user) ? false : true);

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

            let detailResponse = await fetch(URL_DETAIL + String(jwt_decode(data.access).user_id) + "/", {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json'
                }
            });
            let detailData = await detailResponse.json();
            if (response.status === 200){
                localStorage.setItem('paginationValue', detailData.paginationValue)
            } else {
                ToasterError("Detail Failed!");
            }
            
        } else {
            ToasterError("Authentication Failed!");
        }
    }

    let logout = () => {
        localStorage.removeItem('tokens');
        setUser(null);
        setTokens(null);
    }

    useEffect(() => {
        const updateToken = async () => {
            if (!user)
                return;

            let response = await fetch(URL + "refresh/", {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({'refresh':tokens?.refresh})
            })
            let data = await response.json();
            if (response.status === 200){
                setTokens(data);
                setUser(jwt_decode(data.access));
                localStorage.setItem('tokens', JSON.stringify(data));
            } else {
                logout();
            }

            if (loading)
                setLoading(false);
        }
        if (loading)
            updateToken();

        let interval = setInterval(() => {
            if (tokens)
                updateToken();
        }, 1000*60*4)
        return () => clearInterval(interval);
    }, [tokens, loading, setLoading, user]);

    let contextData ={
        tokens: tokens,
        user: user,
        login: login,
        logout: logout,
        userLookup: userLookup,
        setUserLookup: setUserLookup
    }

    return (
        <authContext.Provider value={contextData}>
            {(!loading) ? children : null}
        </authContext.Provider>
    )
}