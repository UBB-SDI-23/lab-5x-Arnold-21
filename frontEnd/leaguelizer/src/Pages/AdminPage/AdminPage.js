import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField, Grid, Button } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

//Initial json object for user value for better clarity
const initialUserValue = {
    "id":"",
    "username":"",
    "role":""
}

export default function AdminPage(){
    /* The above code is defining multiple state variables and their initial values using the useState
    hook in a React functional component. It also imports and uses some hooks and context from
    React. The state variables are used to manage the visibility and data of different lists (user,
    stadium, club, competition, and match), as well as some sorting, pagination, and autocomplete
    functionality. The code also defines a navigate function using the useNavigate hook. */
    const [userListVisible, setUserListVisible] = useState(false);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);

    const [stadiumListVisible, setStadiumListVisible] = useState(false);
    const [clubListVisible, setClubListVisible] = useState(false);
    const [competitionListVisible, setCompetitionListVisible] = useState(false);
    const [matchListVisible, setMatchListVisible] = useState(false); 

    const [ userList, setUserList ] = useState([]);
    const [ userValue, setUserValue ] = useState(initialUserValue);
    const [ orderValue, setOrderValue ] = useState("username");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    const [stadiumList, setStadiumList] = useState([]);
    const [deleteStadiumList, setDeleteStadiumList] = useState([]);
    const [clubList, setClubList] = useState([]);
    const [deleteClubList, setDeleteClubList] = useState([]);
    const [competitionList, setCompetitionList] = useState([]);
    const [deleteCompetitionList, setDeleteCompetitionList] = useState([]);
    const [matchList, setMatchList] = useState([]);
    const [deleteMatchList, setDeleteMatchList] = useState([]);

    const {tokens, user, URL_BASE} = useContext(authContext);
    let navigate = useNavigate();

    //Checking the user privilege, if not alright, the user is navigated back to the main page
    useEffect(() => {
        if (!user)
            navigate("/");
        
        if (user.role !== "Admin")
            navigate("/");
    }, [user, navigate]);

    /* The above code defines four functions that return URLs for different API endpoints related to
    stadiums, clubs, competitions, and matches. The URLs include the current page number and
    pagination value as query parameters. The functions use the `useCallback` hook to memoize the
    URLs and update them only when the `pageNumber` or `paginationValue` variables change. */
    var getUrlForStadiums = useCallback(() => {
        return URL_BASE + "/api/stadiums/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

    var getUrlForClubs = useCallback(() => {
        return URL_BASE + "/api/clubs/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])
    
    var getUrlForCompetitions = useCallback(() => {
        return URL_BASE + "/api/competitions/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

    var getUrlForMatches = useCallback(() => {
        return URL_BASE + "/api/matches/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

   /* The code is using the useEffect hook to fetch data from different API endpoints based on which
   list is currently visible (stadium, club, competition, or match list). It also sets the maximum
   page number for pagination based on the response from the API. Additionally, it resets the delete
   lists for each list type when a new list is made visible. The useEffect hook is triggered
   whenever any of the dependencies (list visibility, pagination value, and setPageMax function)
   change. */
    useEffect(() => {
        if (stadiumListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            fetch(URL_BASE + "/api/stadiums/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (clubListVisible){
            setDeleteStadiumList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            fetch(URL_BASE + "/api/clubs/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (competitionListVisible){
            setDeleteClubList([]);
            setDeleteStadiumList([]);
            setDeleteMatchList([]);
            fetch(URL_BASE + "/api/competitions/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (matchListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteStadiumList([]);
            fetch(URL_BASE + "/api/matches/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
    }, [stadiumListVisible, clubListVisible, competitionListVisible, matchListVisible, paginationValue, setPageMax, URL_BASE]);

    /* The above code is using the `useEffect` hook in React to fetch data from different URLs for
    stadiums, clubs, competitions, and matches. It then sets the state of the corresponding lists
    with the fetched data. The `getUrlForStadiums`, `getUrlForClubs`, `getUrlForCompetitions`, and
    `getUrlForMatches` functions are likely returning the URLs for the respective API endpoints. */
    useEffect(() => {
        fetch(getUrlForStadiums())
            .then(stadium => stadium.json())
            .then(stadium => setStadiumList((stadium.detail === undefined) ? stadium : []));
    }, [getUrlForStadiums])

    useEffect(() => {
        fetch(getUrlForClubs())
            .then(club => club.json())
            .then(club => setClubList((club.detail === undefined) ? club : []));
    }, [getUrlForClubs])

    useEffect(() => {
        fetch(getUrlForCompetitions())
            .then(comp => comp.json())
            .then(comp => setCompetitionList((comp.detail === undefined) ? comp : []));
    }, [getUrlForCompetitions])

    useEffect(() => {
        fetch(getUrlForMatches())
            .then(match => match.json())
            .then(match => setMatchList((match.detail === undefined) ? match : []));
    }, [getUrlForMatches])

    //Getting and updating the pagenumber for the list of users
    useEffect(() => {
        fetch(URL_BASE + "/api/admin/user/?pageNumber=" + String(paginationValue), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue, tokens, URL_BASE]);
    
    //Getting and updating the list of users, based on the page number
    var getUrlForUsers = useCallback(() => {
        return URL_BASE + "/api/admin/user/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        fetch(getUrlForUsers(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }, [getUrlForUsers, tokens])

    //Function to handle row click in table
    const rowClickHandler = (stadium) => {
        setUserValue(stadium);
    } 

    //Function which called by the custom form, when a user action, which could change the list is done
    const refresh = () => {
        setUserValue(initialUserValue);
        fetch(getUrlForUsers(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }

    /**
     * This function refreshes the lists of stadiums, clubs, competitions, and matches based on which
     * list is currently visible.
     */
    const refreshPages = () => {
        if (stadiumListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            setDeleteStadiumList([]);
            fetch(getUrlForStadiums())
                .then(stadium => stadium.json())
                .then(stadium => setStadiumList((stadium.detail === undefined) ? stadium : []));
        }
        if (clubListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            setDeleteStadiumList([]);
            fetch(getUrlForClubs())
                .then(club => club.json())
                .then(club => setClubList((club.detail === undefined) ? club : []));
        }
        if (competitionListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            setDeleteStadiumList([]);
            fetch(getUrlForCompetitions())
                .then(comp => comp.json())
                .then(comp => setCompetitionList((comp.detail === undefined) ? comp : []));
        }
        if (matchListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            setDeleteStadiumList([]);
            fetch(getUrlForMatches())
                .then(match => match.json())
                .then(match => setMatchList((match.detail === undefined) ? match : []));
        }
    }

    //Sorting function for the users, which is sent and called by the table header, only works on the local user list
    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

        var varUserList = userList;
        varUserList.sort((a,b) => {
            if (property !== "id"){
                if (isAscending){
                    return a[property].localeCompare(b[property]);
                }
                return b[property].localeCompare(a[property]);
            }
            if (isAscending){
                return a[property] - b[property];
            }
            return b[property] - a[property];
        });
        setUserList(varUserList);
    }

    //Page navigation functions for the table
    const pageUp = () => {
        if (pageNumber < pageMax) {
            const newPageNumber = pageNumber + 1;
            setPageNumber(newPageNumber);
        }
    }

    const pageDown = () => {
        if (pageNumber > 1) {
            const newPageNumber = pageNumber - 1;
            setPageNumber(newPageNumber);
        }
    }

    //The function is called every few seconds, when the user types somethin in the autocomplete field
    //Gets a list of users, which can be selected through the autocomplete
    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([]);
            fetch(URL_BASE + "/api/admin/user/?name=" + e.target.value, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            }).then(user => user.json())
                .then(user => setAutoCompleteNames(user));
        } catch (error) {
            ToasterError(error);
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    /* The above code defines five functions that use the `useCallback` hook in React. Each function
    returns an array of keys of the first object in a given list (userList, stadiumList, clubList,
    competitionList, and matchList). The `useCallback` hook is used to memoize the functions and
    prevent unnecessary re-renders when the corresponding list props are updated. */
    const getHeadings = useCallback(() => {
        if(userList.length === 0)
            return [];
        return Object.keys(userList[0])
    }, [userList]);

    const getStadiumHeadings = useCallback(() => {
        if(stadiumList.length === 0)
            return [];
        return Object.keys(stadiumList[0])
    }, [stadiumList]);

    const getClubHeading = useCallback(() => {
        if(clubList.length === 0)
            return [];
        return Object.keys(clubList[0])
    }, [clubList]);

    const getCompetitionHeadings = useCallback(() => {
        if(competitionList.length === 0)
            return [];
        return Object.keys(competitionList[0])
    }, [competitionList]);

    const getMatchHeadings = useCallback(() => {
        if(matchList.length === 0)
            return [];
        return Object.keys(matchList[0])
    }, [matchList]);

    /**
     * The above code defines four functions that handle click events on rows and add the clicked item
     * to a corresponding delete list.
     * @param stadium - It is a variable representing a stadium object that is passed as an argument to
     * the stadiumRowClickHandler function.
     */
    const stadiumRowClickHandler = (stadium) => {
        let list = deleteStadiumList
        list.push(stadium)
        setDeleteStadiumList(list)
    } 

    const clubRowClickHandler = (club) => {
        let list = deleteClubList
        list.push(club)
        setDeleteClubList(list)
    } 

    const competitionRowClickHandler = (competition) => {
        let list = deleteCompetitionList
        list.push(competition)
        setDeleteCompetitionList(list)
    } 

    const matchRowClickHandler = (match) => {
        let list = deleteMatchList
        list.push(match)
        setDeleteMatchList(list)
    } 

    /**
     * This function handles the deletion of stadiums by sending a POST request to the server with the
     * list of stadiums to be deleted, but only if the user has admin privileges.
     * @returns The function `stadiumDeleteButtonHandler` returns nothing (`undefined`). It performs
     * some actions such as checking if the user has admin privileges, making a POST request to delete
     * stadiums, and refreshing the page after the request is completed.
     */
    const stadiumDeleteButtonHandler = () => {
        if (user.role !== "Admin"){
            ToasterError("No admin privilege");
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "stadiums": deleteStadiumList
            })
        };
        const URL = URL_BASE + "/api/admin/stadiums/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

    /**
     * The function handles the deletion of clubs by sending a POST request to the server with the list
     * of clubs to be deleted, but only if the user has admin privileges.
     * @returns The function `clubDeleteButtonHandler` returns nothing (i.e., `undefined`). It performs
     * some actions such as checking the user's role, making a POST request to delete clubs, and
     * refreshing the pages after the request is completed.
     */
    const clubDeleteButtonHandler = () => {
        if (user.role !== "Admin"){
            ToasterError("No admin privilege");
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "clubs": deleteClubList
            })
        };
        const URL = URL_BASE + "/api/admin/clubs/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

    /**
     * This function handles the deletion of competitions by sending a POST request to the server with
     * the list of competitions to be deleted, but only if the user has admin privileges.
     * @returns The function `competitionDeleteButtonHandler` returns nothing (`undefined`). It only
     * executes some code, such as displaying an error message if the user does not have admin
     * privileges, sending a request to delete competitions if the user is an admin, and refreshing the
     * page after the competitions are deleted.
     */
    const competitionDeleteButtonHandler = () => {
        if (user.role !== "Admin"){
            ToasterError("No admin privilege");
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "comps": deleteCompetitionList
            })
        };
        const URL = URL_BASE + "/api/admin/competitions/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

    /**
     * This function handles the deletion of matches by sending a POST request to the API endpoint, but
     * only if the user has admin privileges.
     * @returns The function `matchDeleteButtonHandler` returns nothing (`undefined`).
     */
    const matchDeleteButtonHandler = () => {
        if (user.role !== "Admin"){
            ToasterError("No admin privilege");
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "matches": deleteMatchList
            })
        };
        const URL = URL_BASE + "/api/admin/matches/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

    /* The above code is rendering a dashboard view with various components such as buttons, forms,
    tables, and autocomplete fields. The view is conditionally rendered based on the user's role and
    the visibility of certain components. The user can see a list of users and perform bulk delete
    operations, or they can see lists of stadiums, clubs, competitions, and matches and perform
    delete operations on them. The view also includes pagination and sorting functionality for the
    tables. */
    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" sx={{ mt: 3 }}
                    onClick={() => (setUserListVisible((!bulkDeleteVisible) ? !userListVisible : userListVisible))}
                >See Bulk Delete</Button>
                <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                    onClick={() => (setBulkDeleteVisible((!userListVisible) ? !bulkDeleteVisible : bulkDeleteVisible))}
                >See Users</Button>
            </Grid>
            {!userListVisible && bulkDeleteVisible && user && user.role === "Admin" &&
                <>
                    <CustomForm value = {userValue} refresh={refresh}/>
                    <Autocomplete sx={{mt:10, width: "100%"}}
                        options={autoCompleteNames}
                        getOptionLabel={(option) => option.username}
                        label="Search User Name"
                        renderInput={(params) => <TextField {...params} label="User" variant="outlined"></TextField>}
                        filterOptions={(x) => x}
                        onInputChange={debouncedHandler}
                        onChange={(event, value) => {
                            if (value) {
                                setUserValue(value);
                            }
                        }}
                    />
                    <CustomTable
                        orderValue = {orderValue}
                        orderDirection = {orderDirection}
                        sortingHandler = {sortingHandler}
                        headerList = {getHeadings()}
                        objectList = {userList}
                        rowClickHandler = {rowClickHandler}
                        pageDown = {pageDown}
                        pageUp = {pageUp}
                        pageNumber = {pageNumber}
                        pageMax = {pageMax}
                        setPageNumber = {setPageNumber}
                        paginationOptions = {paginationValue}
                        paginationHandler = {setPaginationValue}
                    ></CustomTable>
                </>
            }
            {userListVisible && !bulkDeleteVisible && user && user.role === "Admin" &&
                <>
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", pt: 5 }} id="bulkButtons">
                        <Button variant="contained" sx={{ m: 3 }}
                            onClick={() => (setStadiumListVisible((!clubListVisible && !matchListVisible && !competitionListVisible) ? !stadiumListVisible : stadiumListVisible))}
                        >See Stadium List</Button>
                        <Button variant="contained" sx={{ m: 3 }}
                            onClick={() => (setClubListVisible((!stadiumListVisible && !matchListVisible && !competitionListVisible) ? !clubListVisible : clubListVisible))}
                        >See Club List</Button>
                        <Button variant="contained" sx={{ m: 3 }}
                            onClick={() => (setCompetitionListVisible((!clubListVisible && !matchListVisible && !stadiumListVisible) ? !competitionListVisible : competitionListVisible))}
                        >See Competition List</Button>
                        <Button variant="contained" sx={{ m: 3 }}
                            onClick={() => (setMatchListVisible((!clubListVisible && !stadiumListVisible && !competitionListVisible) ? !matchListVisible : stadiumListVisible))}
                        >See Match List</Button>
                    </Grid>
                    {stadiumListVisible && user && user.role === "Admin" &&
                        <>
                            <Autocomplete sx={{mt:10, width: "100%"}}
                                options={deleteStadiumList}
                                getOptionLabel={(option) => option.name}
                                label="Stadiums"
                                renderInput={(params) => <TextField {...params} label="Stadiums" variant="outlined"></TextField>}
                                filterOptions={(x) => x}
                            />
                            <Button variant="contained" sx={{bgcolor: "red", mt:2}} onClick={stadiumDeleteButtonHandler}>Delete</Button>
                            <CustomTable
                                orderValue = {orderValue}
                                orderDirection = {orderDirection}
                                sortingHandler = {sortingHandler}
                                headerList = {getStadiumHeadings()}
                                objectList = {stadiumList}
                                rowClickHandler = {stadiumRowClickHandler}
                                pageDown = {pageDown}
                                pageUp = {pageUp}
                                pageNumber = {pageNumber}
                                pageMax = {pageMax}
                                setPageNumber = {setPageNumber}
                                paginationOptions = {paginationValue}
                                paginationHandler = {setPaginationValue}
                                userClickHandler = {() => {}}
                            ></CustomTable>
                        </>
                    }
                    {clubListVisible && user && user.role === "Admin" &&
                        <>
                            <Autocomplete sx={{mt:10, width: "100%"}}
                                options={deleteClubList}
                                getOptionLabel={(option) => option.name}
                                label="Clubs"
                                renderInput={(params) => <TextField {...params} label="Clubs" variant="outlined"></TextField>}
                                filterOptions={(x) => x}
                            />
                            <Button variant="contained" sx={{bgcolor: "red", mt:2}} onClick={clubDeleteButtonHandler}>Delete</Button>
                            <CustomTable
                                orderValue = {orderValue}
                                orderDirection = {orderDirection}
                                sortingHandler = {sortingHandler}
                                headerList = {getClubHeading()}
                                objectList = {clubList}
                                rowClickHandler = {clubRowClickHandler}
                                pageDown = {pageDown}
                                pageUp = {pageUp}
                                pageNumber = {pageNumber}
                                pageMax = {pageMax}
                                setPageNumber = {setPageNumber}
                                paginationOptions = {paginationValue}
                                paginationHandler = {setPaginationValue}
                                userClickHandler = {() => {}}
                            ></CustomTable>
                        </>
                    }
                    {competitionListVisible && user && user.role === "Admin" &&
                        <>
                            <Autocomplete sx={{mt:10, width: "100%"}}
                                options={deleteCompetitionList}
                                getOptionLabel={(option) => option.name}
                                label="Competitions"
                                renderInput={(params) => <TextField {...params} label="Competitions" variant="outlined"></TextField>}
                                filterOptions={(x) => x}
                            />
                            <Button variant="contained" sx={{bgcolor: "red", mt:2}} onClick={competitionDeleteButtonHandler}>Delete</Button>
                            <CustomTable
                                orderValue = {orderValue}
                                orderDirection = {orderDirection}
                                sortingHandler = {sortingHandler}
                                headerList = {getCompetitionHeadings()}
                                objectList = {competitionList}
                                rowClickHandler = {competitionRowClickHandler}
                                pageDown = {pageDown}
                                pageUp = {pageUp}
                                pageNumber = {pageNumber}
                                pageMax = {pageMax}
                                setPageNumber = {setPageNumber}
                                paginationOptions = {paginationValue}
                                paginationHandler = {setPaginationValue}
                                userClickHandler = {() => {}}
                            ></CustomTable>
                        </>
                    }
                    {matchListVisible && user && user.role === "Admin" &&
                        <>
                            <Autocomplete sx={{mt:10, width: "100%"}}
                                options={deleteMatchList}
                                getOptionLabel={(option) => option.club1.name + " - " + option.club2.name}
                                label="Matches"
                                renderInput={(params) => <TextField {...params} label="Matches" variant="outlined"></TextField>}
                                filterOptions={(x) => x}
                            />
                            <Button variant="contained" sx={{bgcolor: "red", mt:2}} onClick={matchDeleteButtonHandler}>Delete</Button>
                            <CustomTable
                                orderValue = {orderValue}
                                orderDirection = {orderDirection}
                                sortingHandler = {sortingHandler}
                                headerList = {getMatchHeadings()}
                                objectList = {matchList}
                                rowClickHandler = {matchRowClickHandler}
                                pageDown = {pageDown}
                                pageUp = {pageUp}
                                pageNumber = {pageNumber}
                                pageMax = {pageMax}
                                setPageNumber = {setPageNumber}
                                paginationOptions = {paginationValue}
                                paginationHandler = {setPaginationValue}
                                userClickHandler = {() => {}}
                            ></CustomTable>
                        </>
                    }
                </>
            }
        </MainLayout>
    );
}