import { React, useEffect, useState, useCallback, useContext } from "react";
import { Button, Grid } from "@mui/material";
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import authContext from "../../Context/Context";

export default function StadiumPage(){
    /* These are all state variables being declared using the `useState` hook in a React functional
    component. Each variable is declared with an initial value and a corresponding setter function.
    These variables are used to manage the state of the component and trigger re-renders when their
    values change. */
    //Page logic variables
    let {URL_BASE} = useContext(authContext);
    const [leagueStatVisible, setLeagueStatVisible] = useState(false);
    const [clubStatVisible, setClubStatVisible] = useState(false);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    //Variables for the league statistics
    const [ leagueList, setLeagueList ] = useState([]);
    const [ leagueOrderValue, setLeagueOrderValue ] = useState("name");
    const [ leagueOrderDirection, setLeagueOrderDirection ] = useState("asc");
    const [ leaguePageNumber, setLeaguePageNumber ] = useState(1);
    const [ leaguePageMax, setLeaguePageMax ] = useState(1);

    //Variable for the club statistics
    const [ clubList, setClubList ] = useState([]);
    const [ clubOrderValue, setClubOrderValue ] = useState("name");
    const [ clubOrderDirection, setClubOrderDirection ] = useState("asc");
    const [ clubPageNumber, setClubPageNumber ] = useState(1);
    const [ clubPageMax, setClubPageMax ] = useState(1);

    //Functions, which get the number of pages for both statistics, depending on the number of elements per page
    //If that variable changes, the variable changes
    useEffect(() => {
        fetch(URL_BASE + "/api/leaguesByAnnualBudget/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setLeaguePageMax(number["pageNumber"]));
    }, [paginationValue, URL_BASE]);

    useEffect(() => {
        fetch(URL_BASE + "/api/clubsByStadiumCapacity/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setClubPageMax(number["pageNumber"]));
    }, [paginationValue, URL_BASE]);

    //Getting and updating the list of elements, only if their visible
    //The Get Url functions are only here to help in making the code cleaner
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "/api/clubsByStadiumCapacity/?page=" + String(clubPageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [clubPageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        if (clubStatVisible)
            fetch(getUrlForClubs())
                .then(club => club.json())
                .then(club => setClubList(club));
    }, [getUrlForClubs, clubStatVisible])

    var getUrlForLeague = useCallback(() => {
        let URL = URL_BASE + "/api/leaguesByAnnualBudget/?page=" + String(leaguePageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [leaguePageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        if (leagueStatVisible)
            fetch(getUrlForLeague())
                .then(league => league.json())
                .then(league => setLeagueList(league));
    }, [getUrlForLeague, leagueStatVisible])

    //The two sorting function are declared here, and work on the local element list
    //They are called by the custom table module header
    const clubSortingHandler = (property) => {
        const isAscending = clubOrderDirection === "asc";
        setClubOrderValue(property);
        setClubOrderDirection(isAscending ? "desc" : "asc");

        var varClubList = clubList;
        varClubList.sort((a,b) => {
            if (property === "name" || property === "foundedDate"){
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
        setClubList(varClubList);
    }

    const leagueSortingHandler = (property) => {
        const isAscending = leagueOrderDirection === "asc";
        setLeagueOrderValue(property);
        setLeagueOrderDirection(isAscending ? "desc" : "asc");

        var varCompList = leagueList;
        varCompList.sort((a,b) => {
            if (property !== "numberOfTeams" && property !== "prizeMoney" && property !== "avgBudget"){
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
        setLeagueList(varCompList);
    }

    //Four function declarations, that are passed to the custom table, to handle paging of the elements
    const clubPageUp = () => {
        if (clubPageNumber < clubPageMax) {
            const newPageNumber = clubPageNumber + 1;
            setClubPageNumber(newPageNumber);
        }
    }

    const clubPageDown = () => {
        if (clubPageNumber > 1) {
            const newPageNumber = clubPageNumber - 1;
            setClubPageNumber(newPageNumber);
        }
    }

    const leaguePageUp = () => {
        if (leaguePageNumber < leaguePageMax) {
            const newPageNumber = leaguePageNumber + 1;
            setLeaguePageNumber(newPageNumber);
        }
    }

    const leaguePageDown = () => {
        if (leaguePageNumber > 1) {
            const newPageNumber = leaguePageNumber - 1;
            setLeaguePageNumber(newPageNumber);
        }
    }

    //Extracting and headers to pass on to the table
    const getClubHeadings = () => {
        if(clubList.length === 0)
            return [];
        return Object.keys(clubList[0])
    }

    const getLeagueHeadings = () => {
        if(leagueList.length === 0)
            return [];
        return Object.keys(leagueList[0])
    }

    /* This is the JSX code that is being returned by the `StadiumPage` functional component. It is
    rendering a `MainLayout` component that contains two `Button` components. Depending on the state
    of `leagueStatVisible` and `clubStatVisible`, it will render either a `CustomTable` component
    with data from `clubList` or `leagueList`, respectively. The `CustomTable` component is passed
    various props such as `orderValue`, `sortingHandler`, `headerList`, `objectList`, `pageDown`,
    `pageUp`, `pageNumber`, `pageMax`, `setPageNumber`, `paginationOptions`, `paginationHandler`,
    and `aggregateHeader`. These props are used to control the sorting, pagination, and rendering of
    the table. */
    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" sx={{ mt: 3 }}
                    onClick={() => (setLeagueStatVisible((!clubStatVisible) ? !leagueStatVisible : leagueStatVisible))}
                >See League Statistics</Button>
                <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                    onClick={() => (setClubStatVisible((!leagueStatVisible) ? !clubStatVisible : clubStatVisible))}
                >See Club Statistics</Button>
            </Grid>
            {!leagueStatVisible && clubStatVisible &&
                <>
                    <CustomTable
                        orderValue = {clubOrderValue}
                        orderDirection = {clubOrderDirection}
                        sortingHandler = {clubSortingHandler}
                        headerList = {getClubHeadings()}
                        objectList = {clubList}
                        rowClickHandler = {() => {}}
                        pageDown = {clubPageDown}
                        pageUp = {clubPageUp}
                        pageNumber = {clubPageNumber}
                        pageMax = {clubPageMax}
                        setPageNumber = {setClubPageNumber}
                        paginationOptions = {paginationValue}
                        paginationHandler = {setPaginationValue}
                        aggregateHeader = "stadiumCapacity"
                    ></CustomTable>
                </>
            }
            {leagueStatVisible && !clubStatVisible &&
                <>
                    <CustomTable
                        orderValue = {leagueOrderValue}
                        orderDirection = {leagueOrderDirection}
                        sortingHandler = {leagueSortingHandler}
                        headerList = {getLeagueHeadings()}
                        objectList = {leagueList}
                        rowClickHandler = {() => {}}
                        pageDown = {leaguePageDown}
                        pageUp = {leaguePageUp}
                        pageNumber = {leaguePageNumber}
                        pageMax = {leaguePageMax}
                        setPageNumber = {setLeaguePageNumber}
                        paginationOptions = {paginationValue}
                        paginationHandler = {setPaginationValue}
                        aggregateHeader = "avgBudget"
                    ></CustomTable>
                </>
            }
        </MainLayout>
    );
}