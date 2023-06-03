import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

//Empty json object representing the stadium object, for more clearity, inside the code
const initialStadiumValue = {
    "name": "",
    "capacity": "",
    "buildDate": "",
    "renovationDate": "",
    "city": "",
    "description": "",
    "user":{
        "id":"",
        "username":""
    }
}

export default function StadiumPage(){
    /* These are all state variables declared using the `useState` hook in a React functional
    component. */
    const [ stadiumList, setStadiumList ] = useState([]);
    const [ stadiumValue, setStadiumValue ] = useState(initialStadiumValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    //The pagination is either the global value, the user choosen at his user page, or the default 12
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    //Setting up logic variables
    const {setUserLookup, tokens, URL_BASE} = useContext(authContext);
    let navigate = useNavigate();

    //Updating the number of pages, for pagenavigation
    useEffect(() => {
        fetch(URL_BASE + "/api/stadiums/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue, tokens, URL_BASE]);
    
    //Getting and updating the current list of stadiums
    var getUrlForStadiums = useCallback(() => {
        return URL_BASE + "/api/stadiums/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        fetch(getUrlForStadiums())
            .then(stadium => stadium.json())
            .then(stadium => setStadiumList((stadium.detail === undefined) ? stadium : []));
    }, [getUrlForStadiums, tokens])

    //When a user clicks a row in the table, this function is called, so this page knows the element
    //It is passed and called from the table module
    const rowClickHandler = (stadium) => {
        setStadiumValue(stadium);
    } 

    //Initiating a refresh function, for the user operations, so every change initiates a refresh in the list of elements
    const refresh = () => {
        setStadiumValue(initialStadiumValue);
        fetch(getUrlForStadiums())
            .then(stadium => stadium.json())
            .then(stadium => setStadiumList((stadium.detail === undefined) ? stadium : []));
    }

    //Sorting which is passed and called by the table module, it only works on the local list of elements
    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

        var varStadiumList = stadiumList;
        varStadiumList.sort((a,b) => {
            if (property !== "capacity" & property !== "id"){
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
        setStadiumList(varStadiumList);
    }

    //Pagination handlelers which are passed and called by the table module
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

    //This function is called, from the debounced handler, every few seconds
    //It's purpose is to get an autocomplete list for the current user imput, so the user can find stadiums more easily
    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([]);
            fetch(URL_BASE + "/api/stadiums/?name=" + e.target.value)
                .then(stadium => stadium.json())
                .then(stadium => setAutoCompleteNames(stadium));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    //Extracting the headers of the stadium object, to be passed on to the table for it's header
    const getHeadings = useCallback(() => {
        if(stadiumList.length === 0)
            return [];
        return Object.keys(stadiumList[0])
    }, [stadiumList]);

    //Function which specifically handles if the user clicks on a username in the table
    //The userlookpu variable is responsible for getting the neccessary data in the user page
    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    /* This is the JSX code that is being returned by the functional component `StadiumPage`. It is
    rendering a `MainLayout` component, which contains a `CustomForm` component, an `Autocomplete`
    component, and a `CustomTable` component. The `CustomForm` component is passed the
    `stadiumValue` and `refresh` props, while the `Autocomplete` component is passed the
    `autoCompleteNames`, `debouncedHandler`, and `setStadiumValue` props. The `CustomTable`
    component is passed several props, including `orderValue`, `orderDirection`, `sortingHandler`,
    `headerList`, `objectList`, `rowClickHandler`, `pageDown`, `pageUp`, `pageNumber`, `pageMax`,
    `setPageNumber`, `paginationOptions`, `paginationHandler`, `userClickHandler`, and
    `aggregateHeader`. */
    return (
        <MainLayout>
            <CustomForm value = {stadiumValue} refresh={refresh}/>
            <hr id="lineBreak"></hr>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Stadium name"
                renderInput={(params) => <TextField {...params} label="Search Stadium by name" variant="outlined"></TextField>}
                filterOptions={(x) => x}
                onInputChange={debouncedHandler}
                onChange={(event, value) => {
                    if (value) {
                        setStadiumValue(value);
                    }
                }}
            />
            <CustomTable
                orderValue = {orderValue}
                orderDirection = {orderDirection}
                sortingHandler = {sortingHandler}
                headerList = {getHeadings()}
                objectList = {stadiumList}
                rowClickHandler = {rowClickHandler}
                pageDown = {pageDown}
                pageUp = {pageUp}
                pageNumber = {pageNumber}
                pageMax = {pageMax}
                setPageNumber = {setPageNumber}
                paginationOptions = {paginationValue}
                paginationHandler = {setPaginationValue}
                userClickHandler = {userClickHandler}
                aggregateHeader = "NumberOfClubs"
            ></CustomTable>
        </MainLayout>
    );
}