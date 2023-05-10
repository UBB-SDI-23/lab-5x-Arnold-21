import { React, useEffect, useState, useCallback, useContext } from "react";
import { Button, Container, Grid, TextField } from "@mui/material";
import URL_BASE from "./constants";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";

const initialMatchValue = {
    "club1": {
        "id": "",
        "name": ""
    },
    "club2": {
        "id": "",
        "name": ""
    },
    "competition": {
        "id": "",
        "name": ""
    },
    "stadium": {
        "id": "",
        "name": ""
    },
    "roundOfPlay": "",
    "score": "",
    "date": ""
}

export default function CustomForm(props) {
    let {user, tokens} = useContext(authContext);
    const [clubNameValue, setClubNameValue] = useState(props.value.name);
    const [clubAnnualBudgetValue, setClubAnnualBudgetValue] = useState(props.value.annualBudget);
    const [clubStaffValue, setClubStaffValue] = useState(props.value.numberOfStadd);
    const [clubDateValue, setClubDateValue] = useState(props.value.foundedDate);
    const [clubStadiumValue, setClubStadiumValue] = useState(props.value.stadium.name);
    const [clubLeagueValue, setClubLeagueValue] = useState(props.value.league.name);

    const [leagueName, setLeagueName] = useState("");
    const [teamNumber, setTeamNumber] = useState("");
    const [prizeMoney, setPrizeMoney] = useState("");
    const [foundedDate, setFoundedDate] = useState("");
    const [compType, setCompType] = useState("");

    const [club2Value, setClub2Value] = useState("");
    const [compValue, setCompValue] = useState("");
    const [stadiumValue, setStadiumValue] = useState("");
    const [roundValue, setRoundValue] = useState("");
    const [scoreValue, setScoreValue] = useState("");
    const [dateValue, setDateValue] = useState("");

    const [specificLeagueVisible, setSpecificLeagueVisible] = useState(false);
    const [clubMatchesVisible, setClubMatchesVisible] = useState(false);

    const [ matchValue, setMatchValue ] = useState(initialMatchValue);
    const [ matchList, setMatchList ] = useState([]);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    function validateMatch(){
        if (!/^[0-9]{1,2}-[0-9]{1,2}$/.test(scoreValue)){
            ToasterError("Incorrect/Impossible Score!");
            return false;
        }
        if (props.value.id === club2Value){
            ToasterError("The team cannot play with itself!");
            return false;
        }
        if (!/^[0-9]+$/.test(club2Value) && matchValue.club2.id === ""){
            ToasterError("Invalid club2 id");
            return false;
        }
        if (!/^[0-9]+$/.test(stadiumValue) && matchValue.stadium.id === ""){
            ToasterError("Invalid stadium id");
            return false;
        }
        if (!/^[0-9]+$/.test(compValue) && matchValue.competition.id === ""){
            ToasterError("Invalid stadium id");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]*$/.test(roundValue)){
            ToasterError("Invalid Round of play");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateValue)){
            ToasterError("Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        return true;
    }

    function validateClub() {
        if (!/^[0-9]+$/.test(clubAnnualBudgetValue) | parseInt(clubAnnualBudgetValue) < 0){
            ToasterError("Annual Budget must be a positive integer");
            return false;
        }
        if (!/^[0-9]+$/.test(clubStaffValue) | parseInt(clubStaffValue) < 0){
            ToasterError("Number of staff must be a positive integer");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(clubNameValue)){
            ToasterError("Club Name can only contain numbers and letters");
            return false;
        }
        if (!/^[0-9]+$/.test(clubStadiumValue)){
            ToasterError("Club stadium incorrect!");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(clubDateValue)){
            ToasterError("Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        return true;
    }

    function validateCompetition() {
        if (!/^[0-9]+$/.test(teamNumber) | parseInt(teamNumber) < 0){
            ToasterError("There must be a positive number of teams");
            return false;
        }
        if (!/^[0-9]+$/.test(prizeMoney) | parseInt(prizeMoney) < 0){
            ToasterError("There must be a positive prize");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(leagueName)){
            ToasterError("Competition Name can only contain numbers and letters");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(compType)){
            ToasterError("Competition type can only contain numbers and letters");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(foundedDate)){
            ToasterError("Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        return true;
    }

    const getPageMax = useCallback(() => {
        if (props.value.id === undefined)
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
    
        fetch(URL_BASE + String(props.value.id) + "/competitions/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [props.value.id, paginationValue]);

    useEffect(() => {
        setClubNameValue(props.value.name)
        setClubAnnualBudgetValue(props.value.annualBudget)
        setClubStaffValue(props.value.numberOfStadd)
        setClubDateValue(props.value.foundedDate)
        setClubStadiumValue(props.value.stadium.name)
        setClubLeagueValue(props.value.league.name)

        changeLeagueValues(props.value.league)
        getPageMax();
    }, [props, getPageMax]);

    var getUrlForMatches = useCallback(() => {
        if (props.value.id === undefined)
            return "";

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return "";
        }

        return URL_BASE + String(props.value.id) + "/competitions/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, props.value.id, paginationValue])

    useEffect(() => {
        if (getUrlForMatches() !== "")
            fetch(getUrlForMatches())
                .then(match => match.json())
                .then(match => setMatchList(match));
    }, [getUrlForMatches])

    const changeLeagueValues = (league) => {
        setLeagueName(league.name)
        setTeamNumber(league.numberOfTeams)
        setPrizeMoney(league.prizeMoney)
        setFoundedDate(league.foundedDate)
        setCompType(league.competitionType)
    };

    const changeMatchValues = (match) => {
        setMatchValue(match)
        setClub2Value(match.club2.name)
        setCompValue(match.competition.name)
        setStadiumValue(match.stadium.name)
        setRoundValue(match.roundOfPlay)
        setScoreValue(match.score)
        setDateValue(match.date)
    };

    const rowClickHandler = (match) => {
        changeMatchValues(match);
    } 

    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

        var varMatchList = matchList;
        varMatchList.sort((a,b) => {
            if (property === "competition" | property === "roundOfPlay" | property === "date"){
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
        setMatchList(varMatchList);
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

    const getHeadings = () => {
        if(matchList.length === 0)
            return [];
        return Object.keys(matchList[0])
    }

    const postButtonHandler = () => {
        if (!validateClub()){
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "name": clubNameValue,
                "annualBudget": clubAnnualBudgetValue,
                "numberOfStadd": clubStaffValue,
                "foundedDate": clubDateValue,
                "stadium": clubStadiumValue,
                "league": clubLeagueValue,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const postWithLeagueHandler = () => {
        if (!validateClub || !validateCompetition){
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "name": clubNameValue,
                "annualBudget": clubAnnualBudgetValue,
                "numberOfStadd": clubStaffValue,
                "foundedDate": clubDateValue,
                "stadium": clubStadiumValue,
                "user":(user) ? user.user_id : null,
                "league": {
                    "name": leagueName,
                    "numberOfTeams": teamNumber,
                    "prizeMoney": prizeMoney,
                    "foundedDate": foundedDate,
                    "competitionType": compType,
                    "user":(user) ? user.user_id : null
                }
            })
        };

        fetch(URL_BASE + "league/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.league !== undefined)
                    ToasterError(message.league[0]);
                else if (message.user !== undefined)
                    ToasterError(message.user[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    const putButtonHandler = () => {
        if (!validateClub()){
            return;
        }
        
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "name": clubNameValue,
                "annualBudget": clubAnnualBudgetValue,
                "numberOfStadd": clubStaffValue,
                "foundedDate": clubDateValue,
                "stadium": clubStadiumValue,
                "league": clubLeagueValue
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.league !== undefined)
                    ToasterError(message.league[0]);
                else if (message.user !== undefined)
                    ToasterError(message.user[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    const deleteButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) }
        };

        const URL = URL_BASE + String(props.value.id)

        fetch(URL, requestOptions)
            .then(() => props.refresh());
    }

    const postMatchButtonHandler = () => {
        if (!validateMatch())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : matchValue.club2.id,
                "competition": (/^[0-9]+$/.test(compValue)) ? compValue : matchValue.competition.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : matchValue.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE + String(props.value.id) + "/competitions/" , requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.club1 !== undefined)
                    ToasterError(message.club1[0]);
                else if (message.club2 !== undefined)
                    ToasterError(message.club2[0]);
                else if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.competition !== undefined)
                    ToasterError(message.competition[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else if (message.user !== undefined)
                    ToasterError(message.user);
                else
                    props.refresh();
            })
    }

    const putMatchButtonHandler = () => {
        if (!validateMatch())
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) },
            body: JSON.stringify({
                "id": matchValue.id,
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : matchValue.club2.id,
                "competition": (/^[0-9]+$/.test(compValue)) ? compValue : matchValue.competition.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : matchValue.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/competitions/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.club1 !== undefined)
                    ToasterError(message.club1[0]);
                else if (message.club2 !== undefined)
                    ToasterError(message.club2[0]);
                else if (message.stadium !== undefined)
                    ToasterError(message.stadium[0]);
                else if (message.competition !== undefined)
                    ToasterError(message.competition[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else if (message.user !== undefined)
                    ToasterError(message.user);
                else
                    props.refresh();
            })
    }

    const deleteMatchButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) }
        };

        const URL = URL_BASE + String(matchValue.id) + "/competitions/"

        fetch(URL, requestOptions)
            .then(() => props.refresh());
    }

    return (
        <form className="clubForm">
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <TextField variant="outlined" id="league" value={clubLeagueValue} label="League" onChange={(e) => { setClubLeagueValue(e.target.value) }}>League</TextField>
                <TextField variant="outlined" id="annualBudget" value={clubAnnualBudgetValue} label="Annual Budget" onChange={(e) => { setClubAnnualBudgetValue(e.target.value) }}>Annual Budget</TextField>
                <TextField variant="outlined" id="numberOfStadd" value={clubStaffValue} label="Staff Number" onChange={(e) => { setClubStaffValue(e.target.value) }}>Staff Number</TextField>
                <TextField variant="outlined" id="foundedDate" value={clubDateValue} label="Founded Date" onChange={(e) => { setClubDateValue(e.target.value) }}>Founded Date</TextField>
                <TextField variant="outlined" id="stadium" value={clubStadiumValue} label="Stadium" onChange={(e) => { setClubStadiumValue(e.target.value) }}>Stadium</TextField>
                <TextField variant="outlined" id="name" value={clubNameValue} label="Name" onChange={(e) => { setClubNameValue(e.target.value) }}
                    sx={{ width: "100%", mt: 3 }}
                >Name</TextField>
            </Grid>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                <Button variant="contained" sx={{ bgcolor: "red" }} onClick={deleteButtonHandler}>Delete</Button>
            </Grid>
            <Button variant="contained" sx={{ mt: 3 }}
                onClick={() => (setSpecificLeagueVisible((!clubMatchesVisible) ? !specificLeagueVisible : specificLeagueVisible))}
            >See League Specifics</Button>
            <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                onClick={() => (setClubMatchesVisible((!specificLeagueVisible) ? !clubMatchesVisible : clubMatchesVisible))}
            >See This Clubs Matches</Button>
            {specificLeagueVisible && !clubMatchesVisible &&
                <Container>
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, mt: 10}}>
                        <TextField variant="outlined" id="name" value={leagueName} label="Name" onChange={(e) => { setLeagueName(e.target.value) }}>League Name</TextField>
                        <TextField variant="outlined" id="numberOfTeams" value={teamNumber} label="numberOfTeams" onChange={(e) => { setTeamNumber(e.target.value) }}>Number Of Teams</TextField>
                        <TextField variant="outlined" id="prizeMoney" value={prizeMoney} label="prizeMoney" onChange={(e) => { setPrizeMoney(e.target.value) }}>Prize Money</TextField>
                        <TextField variant="outlined" id="foundedDate" value={foundedDate} label="Founded Date" onChange={(e) => { setFoundedDate(e.target.value) }}>Founded Date</TextField>
                        <TextField variant="outlined" id="competitionType" value={compType} label="competitionType" onChange={(e) => { setCompType(e.target.value) }}>Type</TextField>
                    </Grid>
                    <Button variant="contained" onClick={postWithLeagueHandler} sx={{ mt: 3 }}>Post With League</Button>
                </Container>
            }
            {!specificLeagueVisible && clubMatchesVisible &&
                <Container sx = {{ borderBottom: "solid 10px gray"}}>
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, borderTop:"solid 1px gray", borderBottom:"solid 1px gray", p:5, mt: 10}}>
                        <TextField variant="outlined" id="club2" value={club2Value} label="Club2" onChange={(e) => { setClub2Value(e.target.value) }}>Club2</TextField>
                        <TextField variant="outlined" id="comp" value={compValue} label="Competition" onChange={(e) => { setCompValue(e.target.value) }}>Competition</TextField>
                        <TextField variant="outlined" id="stadium" value={stadiumValue} label="Stadium" onChange={(e) => { setStadiumValue(e.target.value) }}>Stadium</TextField>
                        <TextField variant="outlined" id="round" value={roundValue} label="Round Of Play" onChange={(e) => { setRoundValue(e.target.value) }}>Round Of Play</TextField>
                        <TextField variant="outlined" id="score" value={scoreValue} label="Score" onChange={(e) => { setScoreValue(e.target.value) }}
                            sx={{ width: "45%", mt: 3 }}
                        >Score</TextField>
                        <TextField variant="outlined" id="date" value={dateValue} label="Date" onChange={(e) => { setDateValue(e.target.value) }}
                            sx={{ width: "45%", mt: 3 }}
                        >Date</TextField>
                    </Grid>
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                        <Button variant="contained" onClick={postMatchButtonHandler}>Post</Button>
                        <Button variant="contained" onClick={putMatchButtonHandler}>Put</Button>
                        <Button variant="contained" sx={{ bgcolor: "red" }} onClick={deleteMatchButtonHandler}>Delete</Button>
                    </Grid>

                    <CustomTable
                        orderValue = {orderValue}
                        orderDirection = {orderDirection}
                        sortingHandler = {sortingHandler}
                        headerList = {getHeadings()}
                        objectList = {matchList}
                        rowClickHandler = {rowClickHandler}
                        pageDown = {pageDown}
                        pageUp = {pageUp}
                        pageNumber = {pageNumber}
                        pageMax = {pageMax}
                        setPageNumber = {setPageNumber}
                        paginationOptions = {paginationValue}
                        paginationHandler = {setPaginationValue}
                    ></CustomTable>
                </Container>
            }
        </form>
    );
}