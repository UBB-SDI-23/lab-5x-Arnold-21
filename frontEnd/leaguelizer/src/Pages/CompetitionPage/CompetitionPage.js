import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

//Initial json object for a competition value, for better clearity
const initialCompValue = {
    "name": "",
    "numberOfTeams": "",
    "foundedDate": "",
    "prizeMoney": "",
    "competitionType": "",
    "user":{
        "id":"",
        "username":""
    }
}

export default function StadiumPage(){
    /* This code is defining multiple state variables using the `useState` hook. These variables are
    used to manage the state of the component and its child components. */
    let {setUserLookup, URL_BASE} = useContext(authContext);
    const [ compList, setCompList ] = useState([]);
    const [ compValue, setCompValue ] = useState(initialCompValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    let navigate = useNavigate();

    //Getting and updating the page number for the competiions
    useEffect(() => {
        fetch(URL_BASE + "/api/competitions/?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue, URL_BASE]);
    
    //Getting and updating the competition list of the given page
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "/api/competitions/?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [pageNumber, paginationValue, URL_BASE])

    useEffect(() => {
        fetch(getUrlForClubs())
            .then(comp => comp.json())
            .then(comp => setCompList(comp));
    }, [getUrlForClubs])

    //Function which handles a row click in the table, it is sent and called by the table
    const rowClickHandler = (comp) => {
        setCompValue(comp);
    } 

    //The function is called, when a user action is done, which could change the comp list, to refresh it
    //It is sent and called by the custom form module
    const refresh = () => {
        setCompValue(initialCompValue);
        fetch(getUrlForClubs())
            .then(comp => comp.json())
            .then(comp => setCompList(comp));
    }

    //Sorting function which is sent and called by the table header, it only works on the local list of elements
    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

        var varCompList = compList;
        varCompList.sort((a,b) => {
            if (property !== "numberOfTeams" && property !== "prizeMoney"){
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
        setCompList(varCompList);
    }

    //Page navigation function which are passed and called by the table
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

    //The function is called every few seconds, when a user writes text in the autocomplete section
    //It gets a set of elements for the autocomplete, from which the user can choose an item
    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([])
            fetch(URL_BASE + "/api/competitions/?name=" + e.target.value)
                .then(club => club.json())
                .then(club => setAutoCompleteNames(club));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    //Calculating the headers for the table
    const getHeadings = () => {
        if(compList.length === 0)
            return [];
        let headingsMap = Object.keys(compList[0]);
        //Deleting the clubs header, since it doesn't need to be rendered in the table
        headingsMap.splice(headingsMap.indexOf('clubs'),1);
        return headingsMap;
    }

    //Specific function to handle when the user clicks on a username, sent and called by the table
    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    /* The `return` statement is rendering the JSX code for the StadiumPage component. It includes the
    MainLayout component, which is the main layout for the page, and three child components:
    CustomForm, Autocomplete, and CustomTable. */
    return (
        <MainLayout>
            <CustomForm value = {compValue} refresh={refresh} userClickHandler = {userClickHandler}/>
            <hr class="lineBreak"></hr>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Comp Name"
                renderInput={(params) => <TextField {...params} label="Search competition by name" variant="outlined"></TextField>}
                filterOptions={(x) => x}
                onInputChange={debouncedHandler}
                onChange={(event, value) => {
                    if (value) {
                        setCompValue(value);
                    }
                }}
            />
            <CustomTable
                orderValue = {orderValue}
                orderDirection = {orderDirection}
                sortingHandler = {sortingHandler}
                headerList = {getHeadings()}
                objectList = {compList}
                rowClickHandler = {rowClickHandler}
                pageDown = {pageDown}
                pageUp = {pageUp}
                pageNumber = {pageNumber}
                pageMax = {pageMax}
                setPageNumber = {setPageNumber}
                paginationOptions = {paginationValue}
                paginationHandler = {setPaginationValue}
                userClickHandler = {userClickHandler}
                aggregateHeader = "numberOfTeams"
            ></CustomTable>
        </MainLayout>
    );
}