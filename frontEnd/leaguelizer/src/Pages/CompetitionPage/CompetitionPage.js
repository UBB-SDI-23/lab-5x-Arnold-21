import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

const initialCompValue = {
    "name": "",
    "numberOfTeams": "",
    "foundedDate": "",
    "prizeMoney": "",
    "competitionType": ""
}

export default function StadiumPage(){
    let {setUserLookup} = useContext(authContext);
    const [ compList, setCompList ] = useState([]);
    const [ compValue, setCompValue ] = useState(initialCompValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    let navigate = useNavigate();

    useEffect(() => {
        fetch(URL_BASE + "?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue]);
    
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
        return URL;
    }, [pageNumber, paginationValue])

    useEffect(() => {
        fetch(getUrlForClubs())
            .then(comp => comp.json())
            .then(comp => setCompList(comp));
    }, [getUrlForClubs])

    const rowClickHandler = (comp) => {
        setCompValue(comp);
    } 

    const refresh = () => {
        setCompValue(initialCompValue);
        fetch(getUrlForClubs())
            .then(comp => comp.json())
            .then(comp => setCompList(comp));
    }

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
        if(compList.length === 0)
            return [];
        let headingsMap = Object.keys(compList[0]);
        headingsMap.splice(headingsMap.indexOf('clubs'),1);
        return headingsMap;
    }

    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

    return (
        <MainLayout>
            <CustomForm value = {compValue} refresh={refresh} userClickHandler = {userClickHandler}/>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Comp Name"
                renderInput={(params) => <TextField {...params} label="Comp" variant="outlined"></TextField>}
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
            ></CustomTable>
        </MainLayout>
    );
}