import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

//Empty json object of a match, for better clearity
const initialMatchValue = {
    "club1": {
        "name": ""
    },
    "club2": {
        "name": ""
    },
    "competition": {
        "name": ""
    },
    "stadium": {
        "name": ""
    },
    "roundOfPlay": "",
    "score": "",
    "date": ""
}

export default function MatchPage(){
    /* This code block is declaring and initializing multiple state variables and constants using React
    hooks. */
    let {setUserLookup, URL_BASE} = useContext(authContext);
    const [ matchList, setMatchList ] = useState([]);
    const [ matchValue, setMatchValue ] = useState(initialMatchValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    let navigate = useNavigate();

    //Function, which gets and updates the pagenumber according to the number of elements in a page
    useEffect(() => {
        fetch(URL_BASE + "/api/matches/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue, URL_BASE]);
    
    //Functions, which get and update the match elements, according to the number of elements in a page and the page number
    var getUrlForMatches = useCallback(() => {
        return URL_BASE + "/api/matches/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        fetch(getUrlForMatches())
            .then(match => match.json())
            .then(match => setMatchList(match))
    }, [getUrlForMatches])

    //Function which handles the click of an element in the table, it is sent and called by the table
    const rowClickHandler = (match) => {
        setMatchValue(match);
    } 

    //Function which refreshes the list of elements, when a user does an action which could change that
    const refresh = () => {
        setMatchValue(initialMatchValue);
        fetch(getUrlForMatches())
            .then(match => match.json())
            .then(match => setMatchList(match));
    }

    //The handler is sent and called by the table header, and only works on the local data
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

    //Pagination navigation function which are sent and called by the table
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

    //Function which is called every few seconds, it is responsible for the autocomplete, it gets back elements, which can be choosen by the user
    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([])
            fetch(URL_BASE + "/api/matches/?date=" + e.target.value)
                .then(match => match.json())
                .then(match => setAutoCompleteNames(match));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    //Calculating the headers of the match element, which is than sent to the table
    const getHeadings = () => {
        if(matchList.length === 0)
            return [];
        return Object.keys(matchList[0])
    }

    //Function which specifically handles if the user clicks on a username in the table
    //The userlookpu variable is responsible for getting the neccessary data in the user page
    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    /* This code block is returning a JSX element that contains a `MainLayout` component, an
    `Autocomplete` component, and a `CustomTable` component. The `CustomForm` component is also
    included as a child of the `MainLayout` component. The `Autocomplete` component is used to
    search for matches by date, and the `CustomTable` component displays a table of matches with
    various sorting and pagination options. The props for the `CustomTable` component are passed in
    from state variables and functions defined earlier in the code. */
    return (
        <MainLayout>
            <CustomForm value = {matchValue} refresh={refresh}/>
            <hr id="lineBreak"></hr>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.club1.name + " - " + option.club2.name}
                label="Search Match Date"
                renderInput={(params) => <TextField {...params} label="Search by match date(yyyy-mm-dd)" variant="outlined"></TextField>}
                filterOptions={(x) => x}
                onInputChange={debouncedHandler}
                onChange={(event, value) => {
                    if (value) {
                        setMatchValue(value);
                    }
                }}
            />
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
                userClickHandler = {userClickHandler}
                aggregateHeader = "avgleaguebudget"
            ></CustomTable>
        </MainLayout>
    );
}