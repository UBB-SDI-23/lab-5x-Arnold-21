import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

//Empty json object for a club instance, for better clarity
const initialClubValue = {
    "name": "",
    "annualBudget": "",
    "numberOfStadd": "",
    "foundedDate": "",
    "stadium": {
        "name": ""
    },
    "league": {
        "name": ""
    },
    "user":{
        "id":"",
        "username":""
    }
}

export default function StadiumPage(){
    /* This code is defining multiple state variables using the `useState` hook, including `clubList`,
    `clubValue`, `orderValue`, `orderDirection`, `pageNumber`, `pageMax`, `autoCompleteNames`,
    `budgetFilter`, `localBudgetFilter`, and `paginationValue`. */
    let {setUserLookup, URL_BASE} = useContext(authContext)
    const [ clubList, setclubList ] = useState([]);
    const [ clubValue, setclubValue ] = useState(initialClubValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ budgetFilter, setBudgetFilter ] = useState(null);
    const [ localBudgetFilter, setLocalBudgetFilter ] = useState(null);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    let navigate = useNavigate();

    //Compared to other pagenumber functions, this is a little more complex, for the simple fact, that it incorporates the budgetfilter
    //If there is a filter present, it gets that pagenumber, otherwise the normal one
    useEffect(() => {
        if (budgetFilter !== null){
            fetch(URL_BASE + "/api/clubs/?pageNumber=" + String(paginationValue) + "&budgetFilter=" + String(budgetFilter))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));

            setPageNumber(1)
        }
        else{
            fetch(URL_BASE + "/api/clubs/?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
    }, [paginationValue, budgetFilter, URL_BASE]);
    
    //Getting and updating the club elements in the list, according to the pagenumber
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "/api/clubs/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
        if (budgetFilter !== null){
            URL += "&budgetFilter=" + String(budgetFilter);
        }
        return URL;
    }, [pageNumber, budgetFilter, paginationValue, URL_BASE])

    useEffect(() => {
        fetch(getUrlForClubs())
            .then(club => club.json())
            .then(club => setclubList(club));
    }, [getUrlForClubs])

    //Function to handle a row click in the table 
    const rowClickHandler = (club) => {
        setclubValue(club);
    } 

    //Function that's being called, when the user makes an action which could change the list
    //The function is created here, because the operations are handled in the custom form module
    const refresh = () => {
        setclubValue(initialClubValue);
        fetch(getUrlForClubs())
            .then(club => club.json())
            .then(club => setclubList(club));
    }

    //Sorting sent and called by the table header, only works on the local data
    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

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
        setclubList(varClubList);
    }

    //Pagination navigation functions for the table of the clubs
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

    //The function is called every few seconds, to handle the autocomplete functionality
    //Gets objects based on partial user input, which can be choosen
    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([])
            fetch(URL_BASE + "/api/clubs/?name=" + e.target.value)
                .then(club => club.json())
                .then(club => setAutoCompleteNames(club));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    //Calculating the header for the table header
    const getHeadings = () => {
        if(clubList.length === 0)
            return [];
        return Object.keys(clubList[0])
    }

    //The function is called every few seconds, for the input change of the budget flter field
    const budgetFetchHandler = (value) => {
        setBudgetFilter(value)
    }

    const debouncedBudgetFetchHandler = useRef(debounce(budgetFetchHandler, 1000)).current

    //Little React quark, the function needs to activaly change the local value, for the input field to work properly
    const budgetFilterHandler = (value) => {
        setLocalBudgetFilter(value)
        debouncedBudgetFetchHandler(value)
    }

    //Function which handles if the user presses a username in the table
    //Userlookup variable is for getting the right userinformation in the user page
    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    /* The code is returning a JSX element that contains a `MainLayout` component, a `CustomForm`
    component, an `Autocomplete` component, a `TextField` component, and a `CustomTable` component.
    The `CustomForm` component is passed a `value` prop and a `refresh` prop. The `Autocomplete`
    component is passed `options`, `getOptionLabel`, `label`, `renderInput`, `filterOptions`,
    `onInputChange`, and `onChange` props. The `TextField` component is passed `variant`, `id`,
    `value`, `label`, `onChange`, and `sx` props. The `CustomTable` component is passed
    `orderValue`, `orderDirection`, `sortingHandler`, `headerList`, `objectList`, `rowClickHandler`,
    `pageDown`, `pageUp`, `pageNumber`, `pageMax`, `setPageNumber`, `paginationOptions`,
    `paginationHandler`, `userClickHandler`, and `aggregateHeader` props. */
    return (
        <MainLayout>
            <CustomForm value = {clubValue} refresh={refresh}/>
            <hr class="lineBreak"></hr>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Club Name"
                renderInput={(params) => <TextField {...params} label="Club" variant="outlined"></TextField>}
                filterOptions={(x) => x}
                onInputChange={debouncedHandler}
                onChange={(event, value) => {
                    if (value) {
                        setclubValue(value);
                    }
                }}
            />
            <TextField variant="outlined" id="BudgetFilter" value={(localBudgetFilter === null) ? "" : localBudgetFilter} label="BudgetFilter" onChange={(e) => {budgetFilterHandler((e.target.value.length === 0) ? null : e.target.value)}}
                sx={{width:"100%", mt:2}}
            >BudgetFilter</TextField>
            <CustomTable
                orderValue = {orderValue}
                orderDirection = {orderDirection}
                sortingHandler = {sortingHandler}
                headerList = {getHeadings()}
                objectList = {clubList}
                rowClickHandler = {rowClickHandler}
                pageDown = {pageDown}
                pageUp = {pageUp}
                pageNumber = {pageNumber}
                pageMax = {pageMax}
                setPageNumber = {setPageNumber}
                paginationOptions = {paginationValue}
                paginationHandler = {setPaginationValue}
                userClickHandler = {userClickHandler}
                aggregateHeader = "matchesPlayed"
            ></CustomTable>
        </MainLayout>
    );
}