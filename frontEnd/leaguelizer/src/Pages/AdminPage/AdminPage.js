import { React, useEffect, useCallback, useRef, useState, useContext } from "react";
import { Autocomplete, TextField, Grid, Button } from "@mui/material";
import CustomForm from "./CustomForm";
import CustomTable from "../../Layouts/PageLayout/Table/CustomTable"
import MainLayout from "../../Layouts/PageLayout/MainLayout/MainLayout";
import URL_BASE from "./constants";
import { debounce } from "lodash";
import authContext from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import ToasterError from "../../Layouts/ErrorLayout/ToasterError";

const initialUserValue = {
    "id":"",
    "username":"",
    "role":""
}

export default function AdminPage(){
    const [userListVisible, setUserListVisible] = useState(false);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
    const [ userList, setUserList ] = useState([]);
    const [ userValue, setUserValue ] = useState(initialUserValue);
    const [ orderValue, setOrderValue ] = useState("username");
    const [ orderDirection, setOrderDirection ] = useState("asc");
    const [ pageNumber, setPageNumber ] = useState(1);
    const [ pageMax, setPageMax ] = useState(1);
    const [ autoCompleteNames, setAutoCompleteNames ] = useState([]);
    const [ paginationValue, setPaginationValue ] = useState(localStorage.getItem('paginationValue') ? JSON.parse(localStorage.getItem('paginationValue')) : 12);

    const {tokens, user} = useContext(authContext);
    let navigate = useNavigate();

    useEffect(() => {
        if (!user)
            navigate("/");
        
        if (user.role !== "Admin")
            navigate("/");
    }, [user, navigate]);

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
            .then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }, [getUrlForStadiums, tokens])

    const rowClickHandler = (stadium) => {
        setUserValue(stadium);
    } 

    const refresh = () => {
        setUserValue(initialUserValue);
        fetch(getUrlForStadiums())
            .then(user => user.json())
            .then(user => setUserList((user.detail === undefined) ? user : []));
    }

    const sortingHandler = (property) => {
        const isAscending = orderDirection === "asc";
        setOrderValue(property);
        setOrderDirection(isAscending ? "desc" : "asc");

        var varUserList = userList;
        varUserList.sort((a,b) => {
            if (property !== "id"){
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
        setUserList(varUserList);
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
                .then(user => user.json())
                .then(user => setAutoCompleteNames(user));
        } catch (error) {
            ToasterError(error);
        }
    };

    const debouncedHandler = useRef(debounce(fetchSuggestion, 500)).current;

    const getHeadings = useCallback(() => {
        if(userList.length === 0)
            return [];
        return Object.keys(userList[0])
    }, [userList]);

    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" sx={{ mt: 3 }}
                    onClick={() => (setUserListVisible((!bulkDeleteVisible) ? !userListVisible : userListVisible))}
                >See Bulk Delete</Button>
                <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                    onClick={() => (setBulkDeleteVisible((!userListVisible) ? !bulkDeleteVisible : bulkDeleteVisible))}
                >See Users</Button>
            </Grid>
            {!userListVisible && bulkDeleteVisible && user && user.role === "Admin" &&
                <>
                    <CustomForm value = {userValue} refresh={refresh}/>
                    <Autocomplete sx={{mt:10, width: "100%"}}
                        options={autoCompleteNames}
                        getOptionLabel={(option) => option.username}
                        label="Search User Name"
                        renderInput={(params) => <TextField {...params} label="User" variant="outlined"></TextField>}
                        filterOptions={(x) => x}
                        onInputChange={debouncedHandler}
                        onChange={(event, value) => {
                            if (value) {
                                setUserValue(value);
                            }
                        }}
                    />
                    <CustomTable
                        orderValue = {orderValue}
                        orderDirection = {orderDirection}
                        sortingHandler = {sortingHandler}
                        headerList = {getHeadings()}
                        objectList = {userList}
                        rowClickHandler = {rowClickHandler}
                        pageDown = {pageDown}
                        pageUp = {pageUp}
                        pageNumber = {pageNumber}
                        pageMax = {pageMax}
                        setPageNumber = {setPageNumber}
                        paginationOptions = {paginationValue}
                        paginationHandler = {setPaginationValue}
                    ></CustomTable>
                </>
            }
            {userListVisible && !bulkDeleteVisible && user && user.role === "Admin" &&
                <>
                    
                </>
            }
        </MainLayout>
    );
}