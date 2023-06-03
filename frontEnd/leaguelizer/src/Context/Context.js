import { useState, useEffect, createContext } from "react";
import jwt_decode from "jwt-decode";
import ToasterError from "../Layouts/ErrorLayout/ToasterError";

const authContext = createContext();

// Providing the base url for all components in the context
const URL_BASE = "https://SArnold-sdi-22-23.crabdance.com";
const URL_SOCKET = "wss://SArnold-sdi-22-23.crabdance.com/ws/room/";

const URL = URL_BASE + "/api/token/";
const URL_DETAIL = URL_BASE + "/api/user/";


export default authContext;

// The context component, ehich contains all the neccessary information that the website might need to provide context
export const AuthProvider = ({children}) => {
    // The neccessary info for the different states of the website
    let [ tokens, setTokens ] = useState(localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null);
    let [ user, setUser ] = useState(localStorage.getItem('tokens') ? jwt_decode(JSON.parse(localStorage.getItem('tokens')).access) : null);
    let [ userLookup, setUserLookup ] = useState(-1);
    let [ loading, setLoading ] = useState(true);

    // Login handling, which is exported and used by other components, to be able to be seen in the whole context
    let login = async (username, password) => {
        //Checking login
        let response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'username':username, 'password':password})
        });
        let data = await response.json();

        //Checking sent back login data
        if (response.status === 200){
            setTokens(data);
            setUser(jwt_decode(data.access));
            localStorage.setItem('tokens', JSON.stringify(data));

            //Getting the pagination value of the logged in user, to be used at the other components
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

    // Logout function for the whole context
    let logout = () => {
        localStorage.removeItem('tokens');
        setUser(null);
        setTokens(null);
    }

    // The following use effect, is written, so if any variables are updated, for example if a force loading is needed
    // Creates a funciton updateToken, which refreshes the acces token gotten from backend, every four minutes
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

    //Declaring the variables in the context, that the other components will use
    let contextData ={
        tokens: tokens,
        user: user,
        login: login,
        logout: logout,
        userLookup: userLookup,
        setUserLookup: setUserLookup,
        URL_BASE: URL_BASE,
        URL_SOCKET: URL_SOCKET
    }

    //Draw the children given from the application js
    return (
        <authContext.Provider value={contextData}>
            {(!loading) ? children : null}
        </authContext.Provider>
    )
}