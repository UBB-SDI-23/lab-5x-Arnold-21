import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField, Grid, Button } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

const initialUserValue = {
    "id":"",
    "username":"",
    "role":""
}

export default function AdminPage(){
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

    const {tokens, user} = useContext(authContext);
    let navigate = useNavigate();

    useEffect(() => {
        if (!user)
            navigate("/");
        
        if (user.role !== "Admin")
            navigate("/");
    }, [user, navigate]);

    var getUrlForStadiums = useCallback(() => {
        return "https://SArnold-sdi-22-23.chickenkiller.com/api/stadiums/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])

    var getUrlForClubs = useCallback(() => {
        return "https://SArnold-sdi-22-23.chickenkiller.com/api/clubs/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])
    
    var getUrlForCompetitions = useCallback(() => {
        return "https://SArnold-sdi-22-23.chickenkiller.com/api/competitions/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])

    var getUrlForMatches = useCallback(() => {
        return "https://SArnold-sdi-22-23.chickenkiller.com/api/matches/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])

    useEffect(() => {
        if (stadiumListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            fetch("https://SArnold-sdi-22-23.chickenkiller.com/api/stadiums/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (clubListVisible){
            setDeleteStadiumList([]);
            setDeleteCompetitionList([]);
            setDeleteMatchList([]);
            fetch("https://SArnold-sdi-22-23.chickenkiller.com/api/clubs/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (competitionListVisible){
            setDeleteClubList([]);
            setDeleteStadiumList([]);
            setDeleteMatchList([]);
            fetch("https://SArnold-sdi-22-23.chickenkiller.com/api/competitions/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
        if (matchListVisible){
            setDeleteClubList([]);
            setDeleteCompetitionList([]);
            setDeleteStadiumList([]);
            fetch("https://SArnold-sdi-22-23.chickenkiller.com/api/matches/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
    }, [stadiumListVisible, clubListVisible, competitionListVisible, matchListVisible, paginationValue, setPageMax]);

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

    useEffect(() => {
        fetch(URL_BASE + "?pageNumber=" + String(paginationValue), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue, tokens]);
    
    var getUrlForUsers = useCallback(() => {
        return URL_BASE + "?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])

    useEffect(() => {
        fetch(getUrlForUsers(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }, [getUrlForUsers, tokens])

    const rowClickHandler = (stadium) => {
        setUserValue(stadium);
    } 

    const refresh = () => {
        setUserValue(initialUserValue);
        fetch(getUrlForUsers(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
        }).then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }

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

    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([]);
            fetch(URL_BASE + "?name=" + e.target.value, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            }).then(user => user.json())
                .then(user => setAutoCompleteNames(user));
        } catch (error) {
            ToasterError(error);
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

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
        const URL = "https://SArnold-sdi-22-23.chickenkiller.com/api/admin/stadiums/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

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
        const URL = "https://SArnold-sdi-22-23.chickenkiller.com/api/admin/clubs/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

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
        const URL = "https://SArnold-sdi-22-23.chickenkiller.com/api/admin/competitions/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

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
        const URL = "https://SArnold-sdi-22-23.chickenkiller.com/api/admin/matches/";
        fetch(URL, requestOptions)
            .then(() => {refreshPages();});
    }

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
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
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