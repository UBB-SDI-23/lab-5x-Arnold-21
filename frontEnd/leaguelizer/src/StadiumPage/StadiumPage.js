import { React, useEffect, useCallback, useRef } from "react";
import debounce from "lodash";
import { Container, Autocomplete, TextField, Button, Table } from "@mui/material";
import CustomForm from "./CustomForm";
import TableHeader from "./Table/TableHeader";
import TableContent from "./Table/TableContent";
import URL_BASE from "./constants";


const initialStadiumValue = {
    "name": "asd",
    "capacity": "",
    "buildDate": "",
    "renovationDate": "",
    "city": "",
    "description": ""
}

export default function StadiumPage(){
    const [ stadiumList, setStadiumList ] = React.useState([]);
    const [ stadiumValue, setStadiumValue ] = React.useState(initialStadiumValue);
    const [ orderValue, setOrderValue ] = React.useState("name");
    const [ orderDirection, setOrderDirection ] = React.useState("asc");
    const [ pageNumber, setPageNumber ] = React.useState(1);
    const [ pageMax, setPageMax ] = React.useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = React.useState([]);

    useEffect(() => {
        fetch(URL_BASE + "?pageNumber=0")
            .then(number => number.json())
            .then(number => setPageMax(number["pageNumber"]));
    }, []);
    
    var getUrlForStadiums = useCallback(() => {
        // var URL = "SArnold-sdi-22-23.chickenkiller.com/stadiums/";
        return URL_BASE + "?page=" + String(pageNumber);
    }, [pageNumber])

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
            if (property !== "capacity"){
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

    return (
        <Container>
            <CustomForm value = {stadiumValue} refresh={refresh}/>
            <Autocomplete sx={{mt:10, width: "100%"}}
                options={autoCompleteNames}
                getOptionLabel={(option) => option.name}
                label="Search Stadium name"
                renderInput={(params) => <TextField {...params} label="Teacher" variant="outlined"></TextField>}
                filterOptions={(x) => x}
                onInputChange={debouncedHandler}
                onChange={(event, value) => {
                    if (value) {
                        setStadiumValue(value);
                    }
                }}
            />
            <Button variant="contained" onClick={pageDown} sx={{mt:3, mr:10}}>Previous Page</Button>
            <Button variant="contained" onClick={pageUp} sx={{mt:3}}>Next Page</Button>
            <Table sx={{mt: 5}}>
                <TableHeader 
                    orderValue = {orderValue}
                    orderDirection = {orderDirection}
                    sortHandler={sortingHandler}
                />
                <TableContent stadiumList={stadiumList} handler={rowClickHandler}/>
            </Table>
        </Container>
    );
}