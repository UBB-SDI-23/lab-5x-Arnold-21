import { React, useEffect, useState, useCallback } from "react";
import { Button, Grid } from "@mui/material";
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import statURLS from "./constants";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";

export default function StadiumPage(){
    const [leagueStatVisible, setLeagueStatVisible] = useState(false);
    const [clubStatVisible, setClubStatVisible] = useState(false);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    const [ leagueList, setLeagueList ] = useState([]);
    const [ leagueOrderValue, setLeagueOrderValue ] = useState("name");
    const [ leagueOrderDirection, setLeagueOrderDirection ] = useState("asc");
    const [ leaguePageNumber, setLeaguePageNumber ] = useState(1);
    const [ leaguePageMax, setLeaguePageMax ] = useState(1);

    const [ clubList, setClubList ] = useState([]);
    const [ clubOrderValue, setClubOrderValue ] = useState("name");
    const [ clubOrderDirection, setClubOrderDirection ] = useState("asc");
    const [ clubPageNumber, setClubPageNumber ] = useState(1);
    const [ clubPageMax, setClubPageMax ] = useState(1);

    useEffect(() => {
        fetch(statURLS.league + "?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setLeaguePageMax(number["pageNumber"]));
    }, [paginationValue]);

    useEffect(() => {
        fetch(statURLS.clubs + "?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setClubPageMax(number["pageNumber"]));
    }, [paginationValue]);

    var getUrlForClubs = useCallback(() => {
        let URL = statURLS.clubs + "?page=" + String(clubPageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [clubPageNumber, paginationValue])

    useEffect(() => {
        if (clubStatVisible)
            fetch(getUrlForClubs())
                .then(club => club.json())
                .then(club => setClubList(club));
    }, [getUrlForClubs, clubStatVisible])

    var getUrlForLeague = useCallback(() => {
        let URL = statURLS.league + "?page=" + String(leaguePageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [leaguePageNumber, paginationValue])

    useEffect(() => {
        if (leagueStatVisible)
            fetch(getUrlForLeague())
                .then(league => league.json())
                .then(league => setLeagueList(league));
    }, [getUrlForLeague, leagueStatVisible])

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