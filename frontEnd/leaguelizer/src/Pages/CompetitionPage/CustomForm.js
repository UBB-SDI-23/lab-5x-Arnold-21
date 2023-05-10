import { React, useEffect, useState, useCallback, useContext } from "react";
import { Button, Grid, TextField, Autocomplete, Container } from "@mui/material";
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
    "date": "",
    "user":{
        "id":"",
        "username":""
    }
}

export default function CustomForm(props) {
    let {user} = useContext(authContext);
    const [compNameValue, setCompNameValue] = useState(props.value.name);
    const [compTeamValue, setCompTeamValue] = useState(props.value.numberOfTeams);
    const [compDateValue, setCompDateValue] = useState(props.value.foundedDate);
    const [compPrizeValue, setCompPrizeValue] = useState(props.value.prizeMoney);
    const [compTypeValue, setCompTypeValue] = useState(props.value.competitionType);

    const [clubNameValue, setClubNameValue] = useState("");
    const [clubAnnualBudgetValue, setClubAnnualBudgetValue] = useState("");
    const [clubStaffValue, setClubStaffValue] = useState("");
    const [clubDateValue, setClubDateValue] = useState("");
    const [clubStadiumValue, setClubStadiumValue] = useState("");

    const [leagueClubs, setLeagueClubs] = useState([]);
    const [ specificLeagueVisible, setSpecificLeagueVisible ] = useState(false);
    const [clubMatchesVisible, setClubMatchesVisible] = useState(false);

    const [club1Value, setClub1Value] = useState("");
    const [club2Value, setClub2Value] = useState("");
    const [stadiumValue, setStadiumValue] = useState("");
    const [roundValue, setRoundValue] = useState("");
    const [scoreValue, setScoreValue] = useState("");
    const [dateValue, setDateValue] = useState("");

    const [ matchValue, setMatchValue ] = useState(initialMatchValue);
    const [ matchList, setMatchList ] = useState([]);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    function validateCompetition() {
        if (!/^[0-9]+$/.test(compTeamValue) | parseInt(compTeamValue) < 0){
            ToasterError("There must be a positive number of teams");
            return false;
        }
        if (!/^[0-9]+$/.test(compPrizeValue) | parseInt(compPrizeValue) < 0){
            ToasterError("There must be a positive prize");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(compNameValue)){
            ToasterError("Competition Name can only contain numbers and letters");
            return false;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(compTypeValue)){
            ToasterError("Competition type can only contain numbers and letters");
            return false;
        }
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(compDateValue)){
            ToasterError("Date needs to have the following format: yyyy-mm-dd");
            return false;
        }
        return true;
    }

    function validateMatch(){
        if (!/^[0-9]{1,2}-[0-9]{1,2}$/.test(scoreValue)){
            ToasterError("Incorrect/Impossible Score!");
            return false;
        }
        if (club1Value === club2Value){
            ToasterError("The team cannot play with itself!");
            return false;
        }
        if (!/^[0-9]+$/.test(club1Value) && matchValue.club1.id === ""){
            ToasterError("Invalid club1 id");
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

    const getPageMax = useCallback(() => {
        if (props.value.id === undefined)
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
    
        fetch(URL_BASE + String(props.value.id) + "/clubs/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [props.value.id, paginationValue]);

    useEffect(() => {
        setCompNameValue(props.value.name)
        setCompTeamValue(props.value.numberOfTeams)
        setCompDateValue(props.value.foundedDate)
        setCompPrizeValue(props.value.prizeMoney)
        setCompTypeValue(props.value.competitionType)

        getPageMax()
    }, [props, getPageMax]);

    var getUrlForMatches = useCallback(() => {
        if (props.value.id === undefined)
            return "";

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return "";
        }

        return URL_BASE + String(props.value.id) + "/clubs/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, props.value.id, paginationValue])

    useEffect(() => {
        if (getUrlForMatches() !== "")
            fetch(getUrlForMatches())
                .then(match => match.json())
                .then(match => setMatchList(match));
    }, [getUrlForMatches])

    useEffect(() => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        
        if (specificLeagueVisible && compNameValue !== "" && props.value.id !== undefined){
            fetch(URL_BASE + String(props.value.id))
                .then(clubs => clubs.json())
                .then(clubs => setLeagueClubs(clubs["clubs"]));
        }
        else{
            setLeagueClubs([]);
        }
    }, [specificLeagueVisible, compNameValue, props, compTypeValue])

    const changeClubValue = (club) => {
        setClubNameValue(club.name)
        setClubAnnualBudgetValue(club.annualBudget)
        setClubStaffValue(club.numberOfStadd)
        setClubDateValue(club.foundedDate)
        setClubStadiumValue(club.stadium.name)
    };

    const changeMatchValues = (match) => {
        setMatchValue(match)
        setClub1Value(match.club1.name)
        setClub2Value(match.club2.name)
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
        if (!validateCompetition())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": compNameValue,
                "numberOfTeams": compTeamValue,
                "foundedDate": compDateValue,
                "prizeMoney": compPrizeValue,
                "competitionType": compTypeValue,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.user !== undefined)
                    ToasterError(message.user[0]);
                else if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    const putButtonHandler = () => {
        if (!validateCompetition())
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        if (user.role === "Regular" && user.user_id !== props.value.user.id){
            ToasterError("It's not your Competition!");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": compNameValue,
                "numberOfTeams": compTeamValue,
                "foundedDate": compDateValue,
                "prizeMoney": compPrizeValue,
                "competitionType": compTypeValue
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.user !== undefined)
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
            method: 'DELETE'
        };

        const URL = URL_BASE + String(props.value.id)

        fetch(URL, requestOptions)
            .then(() => {props.refresh();});
    }

    const postWithClubsHandler = () => {
        if (!validateCompetition())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": compNameValue,
                "numberOfTeams": compTeamValue,
                "foundedDate": compDateValue,
                "prizeMoney": compPrizeValue,
                "competitionType": compTypeValue,
                "user":(user) ? user.user_id : null,
                "clubs": leagueClubs
            })
        };

        fetch(URL_BASE + "leagueClubs/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error);
                else
                    props.refresh();
            })
    }

    const addClubHandler = () => {
        if (!validateClub()){
            return;
        }

        let varLeagueCLubList = leagueClubs;
        const newCLub = {
            "name": clubNameValue,
            "annualBudget": clubAnnualBudgetValue,
            "numberOfStadd": clubStaffValue,
            "foundedDate": clubDateValue,
            "stadium": clubStadiumValue,
            "user":(user) ? user.user_id : null
        }

        varLeagueCLubList.push(newCLub);
        setLeagueClubs(varLeagueCLubList);
    }

    const postMatchButtonHandler = () => {
        if (!validateMatch())
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "club1": (/^[0-9]+$/.test(club1Value)) ? club1Value : matchValue.club1.id,
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : matchValue.club2.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : matchValue.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue,
                "user":(user) ? user.user_id : null
            })
        };

        fetch(URL_BASE + String(props.value.id) + "/clubs/" , requestOptions)
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
        if (user.role === "Regular" && user.user_id !== matchValue.user.id){
            ToasterError("It's not your Match!");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": matchValue.id,
                "club1": (/^[0-9]+$/.test(club1Value)) ? club1Value : matchValue.club1.id,
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : matchValue.club2.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : matchValue.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue
            })
        };

        const URL = URL_BASE + String(props.value.id) + "/clubs/"

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
            method: 'DELETE'
        };

        const URL = URL_BASE + String(matchValue.id) + "/clubs/"

        fetch(URL, requestOptions)
            .then(() => {props.refresh();});
    }

    return (
        <form className="clubForm">
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <TextField variant="outlined" id="name" value={compNameValue} label="name" onChange={(e) => {setCompNameValue(e.target.value)}}>Name</TextField>
                <TextField variant="outlined" id="numberOfTeams" value={compTeamValue} label="numberOfTeams" onChange={(e) => {setCompTeamValue(e.target.value)}}>Team Number</TextField>
                <TextField variant="outlined" id="foundedDate" value={compDateValue} label="foundedDate" onChange={(e) => {setCompDateValue(e.target.value)}}>Founded Date</TextField>
                <TextField variant="outlined" id="prizeMoney" value={compPrizeValue} label="prizeMoney" onChange={(e) => {setCompPrizeValue(e.target.value)}}>Prize Money</TextField>
                <TextField variant="outlined" id="competitionType" value={compTypeValue} label="competitionType" onChange={(e) => {setCompTypeValue(e.target.value)}}>Competition Type</TextField>
            </Grid>
            {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                {((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button> : null }
            </Grid> : null : null }
            <Button variant="contained" sx={{mt:3}}
                onClick={() => (setSpecificLeagueVisible((!clubMatchesVisible) ? !specificLeagueVisible : specificLeagueVisible))}
            >See Clubs In League</Button>
            <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                onClick={() => (setClubMatchesVisible((!specificLeagueVisible) ? !clubMatchesVisible : clubMatchesVisible))}
            >See This Competitions Matches</Button>
            {specificLeagueVisible && !clubMatchesVisible &&
                <>
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, borderTop:"solid 2px black"}}>
                    <TextField variant="outlined" id="annualBudget" value={clubAnnualBudgetValue} label="Annual Budget" onChange={(e) => {setClubAnnualBudgetValue(e.target.value)}}>Annual Budget</TextField>
                    <TextField variant="outlined" id="numberOfStadd" value={clubStaffValue} label="Staff Number" onChange={(e) => {setClubStaffValue(e.target.value)}}>Staff Number</TextField>
                    <TextField variant="outlined" id="foundedDate" value={clubDateValue} label="Founded Date" onChange={(e) => {setClubDateValue(e.target.value)}}>Founded Date</TextField>
                    <TextField variant="outlined" id="stadium" value={clubStadiumValue} label="Stadium" onChange={(e) => {setClubStadiumValue(e.target.value)}}>Stadium</TextField>
                    <TextField variant="outlined" id="name" value={clubNameValue} label="Name" onChange={(e) => {setClubNameValue(e.target.value)}}
                        sx={{width:"100%", mt:3}}
                    >Name</TextField>
                </Grid>
                <Autocomplete sx={{mt:10, width: "100%"}}
                    options={leagueClubs}
                    getOptionLabel={(option) => option.name}
                    label="Clubs in the league"
                    renderInput={(params) => <TextField {...params} label="Club" variant="outlined"></TextField>}
                    filterOptions={(x) => x}
                    onChange={(event, value) => {
                        if (value) {
                            changeClubValue(value);
                            console.log(event);
                        }
                    }}
                />
                {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, borderBottom:"solid 2px black", paddingBottom:2}}>
                    <Button variant="contained" onClick={postWithClubsHandler}>Post League With Clubs</Button>
                    <Button variant="contained"  onClick={addClubHandler}>Add Club To League(local)</Button>
                </Grid> : null : null }
                </>
            }
            {!specificLeagueVisible && clubMatchesVisible &&
                <Container sx = {{ borderBottom: "solid 10px gray"}}>
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, borderTop:"solid 1px gray", borderBottom:"solid 1px gray", p:5, mt: 10}}>
                        <TextField variant="outlined" id="club1" value={club1Value} label="Club1" onChange={(e) => { setClub1Value(e.target.value) }}>Club2</TextField>
                        <TextField variant="outlined" id="club2" value={club2Value} label="Club2" onChange={(e) => { setClub2Value(e.target.value) }}>Competition</TextField>
                        <TextField variant="outlined" id="stadium" value={stadiumValue} label="Stadium" onChange={(e) => { setStadiumValue(e.target.value) }}>Stadium</TextField>
                        <TextField variant="outlined" id="round" value={roundValue} label="Round Of Play" onChange={(e) => { setRoundValue(e.target.value) }}>Round Of Play</TextField>
                        <TextField variant="outlined" id="score" value={scoreValue} label="Score" onChange={(e) => { setScoreValue(e.target.value) }}
                            sx={{ width: "45%", mt: 3 }}
                        >Score</TextField>
                        <TextField variant="outlined" id="date" value={dateValue} label="Date" onChange={(e) => { setDateValue(e.target.value) }}
                            sx={{ width: "45%", mt: 3 }}
                        >Date</TextField>
                    </Grid>
                    {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                        <Button variant="contained" onClick={postMatchButtonHandler}>Post</Button>
                        <Button variant="contained" onClick={putMatchButtonHandler}>Put</Button>
                        {((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                        <Button variant="contained" sx={{ bgcolor: "red" }} onClick={deleteMatchButtonHandler}>Delete</Button> : null }
                    </Grid> : null : null }

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
                        userClickHandler = {props.userClickHandler}
                    ></CustomTable>
                </Container>
            }
        </form>
    );
}