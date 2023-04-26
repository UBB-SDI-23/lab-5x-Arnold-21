import { React, useEffect, useCallback, useRef, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";

const initialCompValue = {
    "name": "",
    "numberOfTeams": "",
    "foundedDate": "",
    "prizeMoney": "",
    "competitionType": ""
}

export default function StadiumPage(){
    const [ compList, setCompList ] = useState([]);
    const [ compValue, setCompValue ] = useState(initialCompValue);
    const [ orderValue, setOrderValue ] = useState("name");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(12);
    const paginationOptions = [12, 20, 40];

    useEffect(() => {
        fetch(URL_BASE + "?pageNumber=" + String(paginationValue))
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, [paginationValue]);
    
    var getUrlForClubs = useCallback(() => {
        let URL = URL_BASE + "?page=" + String(pageNumber);
        return URL;
    }, [pageNumber])

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
        setCompList([]);
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

    return (
        <MainLayout>
            <CustomForm value = {compValue} refresh={refresh}/>
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
                paginationOptions = {paginationOptions}
                paginationHandler = {setPaginationValue}
            ></CustomTable>
        </MainLayout>
    );
}