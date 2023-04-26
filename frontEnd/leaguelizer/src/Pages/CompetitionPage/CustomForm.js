import { React, useEffect, useState, useCallback } from "react";
import { Button, Grid, TextField, Autocomplete, Container } from "@mui/material";
import URL_BASE from "./constants";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

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

    function validateCompetition() {
        if (!/^[0-9]+$/.test(compTeamValue) | parseInt(compTeamValue) < 0){
            ToasterError("There must be a positive number of teams");
            return false;
        }
        if (!/^[0-9]+$/.test(compPrizeValue) | parseInt(compPrizeValue) < 0){
            ToasterError("There must be a positive prize");
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
        return true;
    }

    const getPageMax = useCallback(() => {
        if (props.value.id === undefined)
            return;
    
        fetch(URL_BASE + String(props.value.id) + "/clubs/?pageNumber=0")
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [props.value.id]);

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

        return URL_BASE + String(props.value.id) + "/clubs/?page=" + String(pageNumber);
    }, [pageNumber, props.value.id])

    useEffect(() => {
        if (getUrlForMatches() !== "")
            fetch(getUrlForMatches())
                .then(match => match.json())
                .then(match => setMatchList(match));
    }, [getUrlForMatches])

    useEffect(() => {
        if (specificLeagueVisible && compNameValue !== "" && compTypeValue === "League"){
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
                "competitionType": compTypeValue
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

    const putButtonHandler = () => {
        if (!validateCompetition())
            return;

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
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const deleteButtonHandler = () => {
        const requestOptions = {
            method: 'DELETE'
        };

        const URL = URL_BASE + String(props.value.id)

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
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
                "clubs": leagueClubs
            })
        };

        fetch(URL_BASE + "leagueClubs", requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    props.refresh();
            })
    }

    const addClubHandler = () => {
        let varLeagueCLubList = leagueClubs;
        const newCLub = {
            "name": clubNameValue,
            "annualBudget": clubAnnualBudgetValue,
            "numberOfStadd": clubStaffValue,
            "foundedDate": clubDateValue,
            "stadium": clubStadiumValue
        }
        varLeagueCLubList.push(newCLub);
        setLeagueClubs(varLeagueCLubList);
    }

    const refresh = () => {
        changeMatchValues(initialMatchValue);
        setMatchList([]);
        fetch(getUrlForMatches())
            .then(match => match.json())
            .then(match => setMatchList(match));
    }

    const postMatchButtonHandler = () => {
        if (!validateMatch())
            return;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "club1": (/^[0-9]+$/.test(club1Value)) ? club1Value : matchValue.club1.id,
                "club2": (/^[0-9]+$/.test(club2Value)) ? club2Value : matchValue.club2.id,
                "stadium": (/^[0-9]+$/.test(stadiumValue)) ? stadiumValue : matchValue.stadium.id,
                "roundOfPlay": roundValue,
                "score": scoreValue,
                "date": dateValue
            })
        };

        fetch(URL_BASE + String(props.value.id) + "/clubs/" , requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    refresh();
            })
    }

    const putMatchButtonHandler = () => {
        if (!validateMatch())
            return;

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
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    refresh();
            })
    }

    const deleteMatchButtonHandler = () => {
        const requestOptions = {
            method: 'DELETE'
        };

        const URL = URL_BASE + String(matchValue.id) + "/clubs/"

        fetch(URL, requestOptions)
            .then(message => message.json())
            .then((message) => {
                if (message.error !== undefined)
                    ToasterError(message.error[0]);
                else
                    refresh();
            })
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
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button>
            </Grid>
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
                <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5, borderBottom:"solid 2px black", paddingBottom:2}}>
                    <Button variant="contained" onClick={postWithClubsHandler}>Post League With Clubs</Button>
                    <Button variant="contained"  onClick={addClubHandler}>Add Club To League(local)</Button>
                </Grid>
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
                    ></CustomTable>
                </Container>
            }
        </form>
    );
}