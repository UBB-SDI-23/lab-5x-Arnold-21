import { React, useEffect, useState, useCallback, useContext } from "react";
import { Button, Container, Grid, TextField } from "@mui/material";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";
import authContext from "../../Context/Context";
import "./Form.css"

//Initial Match Value for better clarity in the code
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
    /* The above code is a React component that defines multiple state variables using the useState
    hook. It also defines a few constants and sets their initial values. The component is likely
    part of a larger application that deals with managing data related to sports clubs, leagues, and
    matches. The specific functionality of the component is not clear without additional context. */
    //This CustomForm handles the club as well as the club/match functionalities and club/league functionalities, so for that it needs all of theese variables
    let {user, tokens, URL_BASE} = useContext(authContext);
    //Main club variables
    const [clubNameValue, setClubNameValue] = useState(props.value.name);
    const [clubAnnualBudgetValue, setClubAnnualBudgetValue] = useState(props.value.annualBudget);
    const [clubStaffValue, setClubStaffValue] = useState(props.value.numberOfStadd);
    const [clubDateValue, setClubDateValue] = useState(props.value.foundedDate);
    const [clubStadiumValue, setClubStadiumValue] = useState(props.value.stadium.name);
    const [clubLeagueValue, setClubLeagueValue] = useState(props.value.league.name);

    //Club with league variables
    const [leagueName, setLeagueName] = useState("");
    const [teamNumber, setTeamNumber] = useState("");
    const [prizeMoney, setPrizeMoney] = useState("");
    const [foundedDate, setFoundedDate] = useState("");
    const [compType, setCompType] = useState("");

    //club with match variables
    const [club2Value, setClub2Value] = useState("");
    const [compValue, setCompValue] = useState("");
    const [stadiumValue, setStadiumValue] = useState("");
    const [roundValue, setRoundValue] = useState("");
    const [scoreValue, setScoreValue] = useState("");
    const [dateValue, setDateValue] = useState("");

    //Logical variables
    const [specificLeagueVisible, setSpecificLeagueVisible] = useState(false);
    const [clubMatchesVisible, setClubMatchesVisible] = useState(false);

    //Match and misc variables
    const [ matchValue, setMatchValue ] = useState(initialMatchValue);
    const [ matchList, setMatchList ] = useState([]);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    /**
     * The above code contains three functions for validating input fields related to match, club, and
     * competition information.
     * @returns The functions are returning a boolean value (true or false) depending on whether the
     * input values pass the validation checks or not.
     */
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

    //The following function gets the pagenumber of the matches of a given club
    const getPageMax = useCallback(() => {
        if (props.value.id === undefined)
            return;

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
    
        fetch(URL_BASE + "/api/clubs/" + String(props.value.id) + "/competitions/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [props.value.id, paginationValue, URL_BASE]);

    //Whenever the module refreshes, so do the values
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

    //Getting and updating the matches of a given club (only if it is selected)
    var getUrlForMatches = useCallback(() => {
        if (props.value.id === undefined)
            return "";

        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return "";
        }

        return URL_BASE + "/api/clubs/" + String(props.value.id) + "/competitions/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, props.value.id, paginationValue, URL_BASE])

    useEffect(() => {
        if (getUrlForMatches() !== "")
            fetch(getUrlForMatches())
                .then(match => match.json())
                .then(match => setMatchList(match));
    }, [getUrlForMatches])

    //Function to change the text field of the league, when a club is selected
    const changeLeagueValues = (league) => {
        setLeagueName(league.name)
        setTeamNumber(league.numberOfTeams)
        setPrizeMoney(league.prizeMoney)
        setFoundedDate(league.foundedDate)
        setCompType(league.competitionType)
    };

    //Function to change the match fields, when a club is selected
    const changeMatchValues = (match) => {
        setMatchValue(match)
        setClub2Value(match.club2.name)
        setCompValue(match.competition.name)
        setStadiumValue(match.stadium.name)
        setRoundValue(match.roundOfPlay)
        setScoreValue(match.score)
        setDateValue(match.date)
    };

    //Function to handle the match cliking, sent and called by the table
    const rowClickHandler = (match) => {
        changeMatchValues(match);
    } 

    //Sorting handler for the matches, sent and called by the table header, only works on the local data
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

    //Pagination functions for the match table
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

    //Calculating the match headers for the table header
    const getHeadings = () => {
        if(matchList.length === 0)
            return [];
        return Object.keys(matchList[0])
    }

    /**
     * The function sends a POST request with club information to a server and refreshes the page if
     * successful.
     * @returns The function `postButtonHandler` is returning nothing (`undefined`). It either executes
     * the code inside the function or returns early if the `validateClub` function returns false.
     */
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

        fetch(URL_BASE + "/api/clubs/", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    /**
     * This function sends a POST request to create a new league with a club and league object,
     * including various properties, and displays error messages if necessary.
     * @returns The function `postWithLeagueHandler` is returning nothing (`undefined`). It is making a
     * POST request to a URL and handling the response with some error messages or refreshing the page
     * if successful.
     */
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

        fetch(URL_BASE + "/api/clubs/league/", requestOptions)
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

   /**
    * This is a function that handles the PUT request for updating a club's information and includes
    * validation checks.
    * @returns The function `putButtonHandler` returns nothing (`undefined`) in most cases, except when
    * one of the error conditions is met, in which case it returns early and does not execute the rest
    * of the function.
    */
    const putButtonHandler = () => {
        if (!validateClub()){
            return;
        }
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }
        if (user.role === "Regular" && user.user_id !== props.value.user.id){
            ToasterError("It's not your Club!");
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

        const URL = URL_BASE + "/api/clubs/" + String(props.value.id) + "/"

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

    /**
     * This function handles the deletion of an item by sending a DELETE request to a specified URL and
     * refreshing the page afterwards.
     * @returns If the `props.value.id` is less than 0, the function returns after displaying an error
     * message using the `ToasterError` function. If the `props.value.id` is greater than or equal to
     * 0, the function sends a DELETE request to the specified URL using the `fetch` function and then
     * calls the `props.refresh()` function. However, the function does not explicitly return
     */
    const deleteButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) }
        };

        const URL = URL_BASE + "/api/clubs/" + String(props.value.id)

        fetch(URL, requestOptions)
            .then(() => props.refresh());
    }

    /**
     * This function handles the click event of a button to post a match to a server after validating
     * the input.
     * @returns The function `postMatchButtonHandler` is returning nothing (`undefined`). It is using a
     * `return` statement to exit the function early if the `validateMatch()` function returns false,
     * but it is not returning any value.
     */
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

        fetch(URL_BASE + "/api/clubs/" + String(props.value.id) + "/competitions/" , requestOptions)
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

    /**
     * This function handles the PUT request for updating a match and validates the input values.
     * @returns The function `putMatchButtonHandler` returns nothing (`undefined`) in most cases,
     * except when an error message is displayed, in which case it exits early and does not continue
     * with the fetch request.
     */
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

        const URL = URL_BASE + "/api/clubs/" + String(props.value.id) + "/competitions/"

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

    /**
     * This function handles the deletion of a match and displays an error message if the match ID is
     * not a positive integer.
     * @returns The function `deleteMatchButtonHandler` is returning nothing (`undefined`). It is only
     * executing some code to handle the deletion of a match and refresh the component.
     */
    const deleteMatchButtonHandler = () => {
        if (props.value.id < 0){
            ToasterError("Id needs to be a positive integer");
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + String(tokens?.access) }
        };

        const URL = URL_BASE + "/api/clubs/" + String(matchValue.id) + "/competitions/"

        fetch(URL, requestOptions)
            .then(() => props.refresh());
    }

    /* The above code is rendering a form with various input fields and buttons. It also conditionally
    renders additional input fields and buttons based on user role and whether the "See League
    Specifics" or "See This Clubs Matches" buttons are clicked. The form allows the user to input
    and edit information about a sports club, as well as view and edit information about matches
    played by the club. The form also includes a table component for displaying and sorting match
    data. */
    return (
        <form className="clubForm">
            <Grid container id='inputHolder'>
                <TextField variant="outlined" id="league" value={clubLeagueValue} label="League" onChange={(e) => { setClubLeagueValue(e.target.value) }}>League</TextField>
                <TextField variant="outlined" id="annualBudget" value={clubAnnualBudgetValue} label="Annual Budget" onChange={(e) => { setClubAnnualBudgetValue(e.target.value) }}>Annual Budget</TextField>
                <TextField variant="outlined" id="numberOfStadd" value={clubStaffValue} label="Staff Number" onChange={(e) => { setClubStaffValue(e.target.value) }}>Staff Number</TextField>
                <TextField variant="outlined" id="foundedDate" value={clubDateValue} label="Founded Date" onChange={(e) => { setClubDateValue(e.target.value) }}>Founded Date</TextField>
                <TextField variant="outlined" id="stadium" value={clubStadiumValue} label="Stadium" onChange={(e) => { setClubStadiumValue(e.target.value) }}>Stadium</TextField>
                <TextField variant="outlined" id="name" value={clubNameValue} label="Name" onChange={(e) => { setClubNameValue(e.target.value) }}
                    sx={{ width: "100%", mt: 3 }}
                >Name</TextField>
            </Grid>
            {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                {((user.role === "Moderator" || user.role === "Admin")) ?
                <Button variant="contained" sx={{ bgcolor: "red" }} onClick={deleteButtonHandler}>Delete</Button> : null }
            </Grid> : null : null }
            <hr class="lineBreak"></hr>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Button variant="contained" sx={{ mt: 3, mr: 5, width:200 }}
                    onClick={() => (setSpecificLeagueVisible((!clubMatchesVisible) ? !specificLeagueVisible : specificLeagueVisible))}
                >See League Specifics</Button>
                <Button variant="contained" sx={{ mt: 3, width:200}}
                    onClick={() => (setClubMatchesVisible((!specificLeagueVisible) ? !clubMatchesVisible : clubMatchesVisible))}
                >See This Clubs Matches</Button>
            </Grid>
            {specificLeagueVisible && !clubMatchesVisible &&
                <Container>
                    <Grid container id='leagueHolder'>
                        <TextField variant="outlined" id="name" value={leagueName} label="Name" onChange={(e) => { setLeagueName(e.target.value) }}>League Name</TextField>
                        <TextField variant="outlined" id="numberOfTeams" value={teamNumber} label="numberOfTeams" onChange={(e) => { setTeamNumber(e.target.value) }}>Number Of Teams</TextField>
                        <TextField variant="outlined" id="prizeMoney" value={prizeMoney} label="prizeMoney" onChange={(e) => { setPrizeMoney(e.target.value) }}>Prize Money</TextField>
                        <TextField variant="outlined" id="foundedDate" value={foundedDate} label="Founded Date" onChange={(e) => { setFoundedDate(e.target.value) }}>Founded Date</TextField>
                        <TextField variant="outlined" id="competitionType" value={compType} label="competitionType" onChange={(e) => { setCompType(e.target.value) }}>Type</TextField>
                    </Grid>
                    {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                    <Button variant="contained" onClick={postWithLeagueHandler} sx={{ mt: 3 }}>Post With League</Button> : null : null }
                </Container>
            }
            {!specificLeagueVisible && clubMatchesVisible &&
                <div id='matchContainer'>
                    <Grid container id='matchHolder'>
                        <TextField variant="outlined" id="club2" value={club2Value} label="Club2" onChange={(e) => { setClub2Value(e.target.value) }}>Club2</TextField>
                        <TextField variant="outlined" id="comp" value={compValue} label="Competition" onChange={(e) => { setCompValue(e.target.value) }}>Competition</TextField>
                        <TextField variant="outlined" id="stadium" value={stadiumValue} label="Stadium" onChange={(e) => { setStadiumValue(e.target.value) }}>Stadium</TextField>
                        <TextField variant="outlined" id="round" value={roundValue} label="Round Of Play" onChange={(e) => { setRoundValue(e.target.value) }}>Round Of Play</TextField>
                        <TextField variant="outlined" id="score" value={scoreValue} label="Score" onChange={(e) => { setScoreValue(e.target.value) }}
                        >Score</TextField>
                        <TextField variant="outlined" id="date" value={dateValue} label="Date" onChange={(e) => { setDateValue(e.target.value) }}
                        >Date</TextField>
                    </Grid>
                    {(user !== null) ? ((user.role === "Regular" || user.role === "Moderator" || user.role === "Admin")) ?
                    <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                        <Button variant="contained" onClick={postMatchButtonHandler}>Post</Button>
                        <Button variant="contained" onClick={putMatchButtonHandler}>Put</Button>
                        {((user.role === "Moderator" || user.role === "Admin")) ?
                        <Button variant="contained" sx={{ bgcolor: "red" }} onClick={deleteMatchButtonHandler}>Delete</Button> : null }
                    </Grid> : null : null }
                    <hr></hr>
                                        
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
                        aggregateHeader = "avgleaguebudget"
                    ></CustomTable>
                </div>
            }
            <hr class="lineBreak"></hr>
        </form>
    );
}