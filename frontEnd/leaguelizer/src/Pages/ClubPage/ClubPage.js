import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable";
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

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
    let {setUserLookup} = useContext(authContext)
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

    useEffect(() => {
        if (budgetFilter !== null){
            fetch(URL_BASE + "?pageNumber=" + String(paginationValue) + "&budgetFilter=" + String(budgetFilter))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));

            setPageNumber(1)
        }
        else{
            fetch(URL_BASE + "?pageNumber=" + String(paginationValue))
                .then(number => number.json())
                .then(number => setPageMax(number["pageNumber"]));
        }
    }, [paginationValue, budgetFilter]);
    
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
        if (budgetFilter !== null){
            URL += "&budgetFilter=" + String(budgetFilter);
        }
        return URL;
    }, [pageNumber, budgetFilter, paginationValue])

    useEffect(() => {
        fetch(getUrlForClubs())
            .then(club => club.json())
            .then(club => setclubList(club));
    }, [getUrlForClubs])

    const rowClickHandler = (club) => {
        setclubValue(club);
    } 

    const refresh = () => {
        setclubValue(initialClubValue);
        fetch(getUrlForClubs())
            .then(club => club.json())
            .then(club => setclubList(club));
    }

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
            setAutoCompleteNames([])
            fetch(URL_BASE + "?name=" + e.target.value)
                .then(club => club.json())
                .then(club => setAutoCompleteNames(club));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    const getHeadings = () => {
        if(clubList.length === 0)
            return [];
        return Object.keys(clubList[0])
    }

    const budgetFetchHandler = (value) => {
        setBudgetFilter(value)
    }

    const debouncedBudgetFetchHandler = useRef(debounce(budgetFetchHandler, 1000)).current

    const budgetFilterHandler = (value) => {
        setLocalBudgetFilter(value)
        debouncedBudgetFetchHandler(value)
    }

    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    return (
        <MainLayout>
            <CustomForm value = {clubValue} refresh={refresh}/>
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