import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";

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
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    const {setUserLookup} = useContext(authContext);
    let navigate = useNavigate();

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
        console.log(pageNumber);
        if (pageNumber > 1) {
            const newPageNumber = pageNumber - 1;
            setPageNumber(newPageNumber);
        }
    }

    const fetchSuggestion = async (e) => {
        try {
            setAutoCompleteNames([]);
            fetch(URL_BASE + "?name=" + e.target.value)
                .then(stadium => stadium.json())
                .then(stadium => setAutoCompleteNames(stadium));
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    const getHeadings = useCallback(() => {
        if(stadiumList.length === 0)
            return [];
        return Object.keys(stadiumList[0])
    }, [stadiumList]);

    const userClickHandler = (stadium) => {
        setUserLookup(stadium["user"]["id"]);
        navigate("/user");
    };

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
                paginationOptions = {paginationValue}
                paginationHandler = {setPaginationValue}
                userClickHandler = {userClickHandler}
            ></CustomTable>
        </MainLayout>
    );
}