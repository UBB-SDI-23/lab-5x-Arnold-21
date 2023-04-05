import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Table from "@mui/material/Table";
import React, { useCallback, useEffect } from "react";
import { Button, Container, Grid, TextField } from "@mui/material";

const initialStadiumValue = {
    "name": "asd",
    "capacity": "",
    "buildDate": "",
    "renovationDate": "",
    "city": ""
}

function CustomForm(props) {
    const [stadiumNameValue, setStadiumNameValue] = React.useState(props.value.name);
    const [stadiumBDateValue, setStadiumBDateValue] = React.useState(props.value.name);
    const [stadiumRDateValue, setStadiumRDateValue] = React.useState(props.value.name);
    const [stadiumCityValue, setStadiumCityValue] = React.useState(props.value.name);
    const [stadiumCapacityValue, setStadiumCapacityValue] = React.useState(props.value.name);

    useEffect(() => {
        setStadiumNameValue(props.value.name)
        setStadiumBDateValue(props.value.buildDate)
        setStadiumRDateValue(props.value.renovationDate)
        setStadiumCityValue(props.value.city)
        setStadiumCapacityValue(props.value.capacity)
    }, [props]);

    const postButtonHandler = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": stadiumNameValue,
                "city": stadiumCityValue,
                "capacity": stadiumCapacityValue,
                "buildDate": stadiumBDateValue,
                "renovationDate": stadiumRDateValue
            })
        };

        fetch("http://localhost:8000/stadiums/", requestOptions)
            .then((stadium) => {props.refresh();})
    }

    const putButtonHandler = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": stadiumNameValue,
                "city": stadiumCityValue,
                "capacity": stadiumCapacityValue,
                "buildDate": stadiumBDateValue,
                "renovationDate": stadiumRDateValue
            })
        };

        const URL = "http://localhost:8000/stadiums/" + String(props.value.id) + "/"

        fetch(URL, requestOptions)
            .then((stadium) => {props.refresh();})
    }

    const deleteButtonHandler = () => {
        const requestOptions = {
            method: 'DELETE'
        };

        const URL = "http://localhost:8000/stadiums/" + String(props.value.id)

        fetch(URL, requestOptions)
            .then((stadium) => {props.refresh();})
    }

    return (
        <form className="stadiumForm">
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <TextField variant="outlined" id="name" value={stadiumNameValue} label="Stadium Name" onChange={(e) => {setStadiumNameValue(e.target.value)}}>StadiumName</TextField>
                <TextField variant="outlined" id="bDate" value={stadiumBDateValue} label="Build Date" onChange={(e) => {setStadiumBDateValue(e.target.value)}}>Build Date</TextField>
                <TextField variant="outlined" id="rDate" value={stadiumRDateValue} label="Renovation Date" onChange={(e) => {setStadiumRDateValue(e.target.value)}}>Renovation Date</TextField>
                <TextField variant="outlined" id="city" value={stadiumCityValue} label="City" onChange={(e) => {setStadiumCityValue(e.target.value)}}>City</TextField>
                <TextField variant="outlined" id="capacity" value={stadiumCapacityValue} label="Capacity" onChange={(e) => {setStadiumCapacityValue(e.target.value)}}>Capacity</TextField>
            </Grid>
            <Grid container sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5}}>
                <Button variant="contained" onClick={postButtonHandler}>Post</Button>
                <Button variant="contained" onClick={putButtonHandler}>Put</Button>
                <Button variant="contained" sx={{bgcolor: "red"}} onClick={deleteButtonHandler}>Delete</Button>
            </Grid>
        </form>
    );
}

function TableHeader(props) {
    const { orderValue, orderDirection, sortHandler } = props;

    return (
        <TableHead sx={{bgcolor: "lightgray", borderBottom: 3}}>
            <TableRow>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "name"}
                        direction={orderValue === "name" ? orderDirection : "asc"}
                        onClick={() => sortHandler("name")}
                    >
                    Name
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "city"}
                        direction={orderValue === "city" ? orderDirection : "asc"}
                        onClick={() => sortHandler("city")}
                    >
                    City
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "buildDate"}
                        direction={orderValue === "buildDate" ? orderDirection : "asc"}
                        onClick={() => sortHandler("buildDate")}
                    >
                    Built Date
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "renovationDate"}
                        direction={orderValue === "renovationDate" ? orderDirection : "asc"}
                        onClick={() => sortHandler("renovationDate")}
                    >
                    Renovation Date
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "capacity"}
                        direction={orderValue === "capacity" ? orderDirection : "asc"}
                        onClick={() => sortHandler("capacity")}
                    >
                    Capacity
                    </TableSortLabel>
                </TableCell>
            </TableRow>
          </TableHead>
    );
}

function TableContent(props){
    const stadiumList = props.stadiumList;
    const rowClickHandler = props.handler;

    return (
        <TableHead>
            {stadiumList.map((stadium) => {
                return (
                    <TableRow
                        onClick = {() => rowClickHandler(stadium)}
                        key={stadium.id} 
                        sx={{":hover": {bgcolor: "lightgray", cursor: "pointer"}}}
                    >
                        <TableCell>{stadium.name}</TableCell>
                        <TableCell>{stadium.city}</TableCell>
                        <TableCell>{stadium.buildDate}</TableCell>
                        <TableCell>{stadium.renovationDate}</TableCell>
                        <TableCell>{stadium.capacity}</TableCell>
                    </TableRow>
                );
            })}
        </TableHead>
    );
}

export default function CustomTable(){
    const [ stadiumList, setStadiumList ] = React.useState([]);
    const [ stadiumValue, setStadiumValue ] = React.useState(initialStadiumValue);
    const [ orderValue, setOrderValue ] = React.useState("name");
    const [ orderDirection, setOrderDirection ] = React.useState("asc");
    const [ stadiumNameFilter, setStadiumNameFilter ] = React.useState("");
    
    var getUrlForStadiums = useCallback(() => {
        var URL = "http://localhost:8000/stadiums/"
        if (stadiumNameFilter !== ""){
            URL += "?name=" + stadiumNameFilter;
        }
        return URL;
    }, [stadiumNameFilter])

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

    const searchHandler = (e) => {
        setStadiumNameFilter(e.target.value);
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

    return (
        <Container>
            <CustomForm value = {stadiumValue} refresh={refresh}/>
            <TextField sx={{mt:10, width: "100%"}}
                label="Search Stadium name"
                onChange={searchHandler}
            />
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