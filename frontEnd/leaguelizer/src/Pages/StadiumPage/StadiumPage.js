import { React, useEffect, useCallback, useRef, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";

const initialStadiumValue = {
    "name": "",
    "capacity": "",
    "buildDate": "",
    "renovationDate": "",
    "city": "",
    "description": ""
}

export default function StadiumPage(){
    const [ stadiumList, setStadiumList ] = useState([]);
    const [ stadiumValue, setStadiumValue ] = useState(initialStadiumValue);
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
    
    var getUrlForStadiums = useCallback(() => {
        return URL_BASE + "?page=" + String(pageNumber) + "&pageNumber=" + String(paginationValue);
    }, [pageNumber, paginationValue])

    useEffect(() => {
        fetch(getUrlForStadiums())
            .then(stadium => stadium.json())
            .then(stadium => setStadiumList(stadium));
    }, [getUrlForStadiums])

    const rowClickHandler = (stadium) => {
        setStadiumValue(stadium);
    } 

    const refresh = () => {
        setStadiumValue(initialStadiumValue);
        setStadiumList([]);
        fetch(getUrlForStadiums())
            .then(stadium => stadium.json())
            .then(stadium => setStadiumList(stadium));
    }

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
                .then(stadium => stadium.json())
                .then(stadium => setAutoCompleteNames(stadium));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    const getHeadings = () => {
        if(stadiumList.length === 0)
            return [];
        return Object.keys(stadiumList[0])
    }

    return (
        <MainLayout>
            <CustomForm value = {stadiumValue} refresh={refresh}/>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Stadium name"
                renderInput={(params) => <TextField {...params} label="Stadium" variant="outlined"></TextField>}
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
                paginationOptions = {paginationOptions}
                paginationHandler = {setPaginationValue}
            ></CustomTable>
        </MainLayout>
    );
}