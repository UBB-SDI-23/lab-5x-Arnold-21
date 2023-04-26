import React, { useCallback, useEffect, useState } from 'react'
import { Table, Button, Select, MenuItem } from "@mui/material";
import TableHeader from "./TableHead/TableHeader";
import TableContent from "./TableBody/TableContent";

const buttonStyle ={
    mt: 3,
    width: 2,
    height: "20px",
    mr:2,
    alignSelf: "center"
}

function CustomTable(props) {
    const { orderValue, orderDirection, sortingHandler, headerList, rowClickHandler, objectList, pageDown, pageUp, pageMax, pageNumber, setPageNumber, paginationOptions, paginationHandler } = props;

    const [ buttons, setButtons] = useState([]);

    const pageNumberHandler = useCallback((e) => {
        setPageNumber(parseInt(e.target.value));
    }, [setPageNumber]);

    useEffect(() => {
        let varButtons = []
        let varNumber = parseInt(pageNumber)

        if (pageMax <= 15){
            for (let i = 1; i<=pageMax; i++){
                varButtons.push(<Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</Button>);
            }
        }
        else if (varNumber >= 2 && varNumber <= 6) {
            for (let i = 4; i<varNumber + 3; i++){
                if (i > 3)
                    varButtons.push(<Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</Button>);
            }
            varButtons.push(<Button variant="contained" sx={buttonStyle} key={"dot3"}>...</Button>);
        }
        else if (varNumber >= 7) {
            varButtons.push(<Button variant="contained" sx={buttonStyle} key={"dot1"}>...</Button>);
            for (let i=varNumber-3; i<=varNumber+3; i++){
                if (i < pageMax - 2)
                    varButtons.push(<Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</Button>);
            }
            if (varNumber <= pageMax -7)
                varButtons.push(<Button variant="contained" sx={buttonStyle} key={"dot2"}>...</Button>);
        }
        else{
            varButtons.push(<Button variant="contained" sx={buttonStyle} key={"dot5"}>...</Button>);
        }
        setButtons(varButtons);
    }, [setButtons, pageNumber, setPageNumber, pageNumberHandler, pageMax]);

    return (
        <>
            <div style={{display:"flex", justifyContent:"flex-start", flexDirection:"row", width:"100%"}}>
                <Button variant="contained" onClick={pageDown} sx={{mt:3, width:"80px", mr:1, fontSize:"13px"}}>Previous Page</Button>
                {(pageMax > 15) ? (
                    <>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={1}>1</Button>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={2} key={"button2"}>2</Button>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={3} key={"button3"}>3</Button>
                    </>
                ) : <></>}
                {buttons}
                {(pageMax > 15) ? (
                    <>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax - 2} key={"button" + String(pageMax - 2)}>{pageMax - 2}</Button>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax - 1} key={"button" + String(pageMax - 1)}>{pageMax - 1}</Button>
                        <Button variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax} key={"button" + String(pageMax)}>{pageMax}</Button>
                    </>
                ) : <></>}
                <Button variant="contained" onClick={pageUp} sx={{mt:3, width:"80px", mr:1, fontSize:"13px"}}>Next Page</Button>
                <Select
                    value={paginationOptions}
                    label="12"
                    onChange={(e) => (paginationHandler(e.target.value))}
                    sx={{ml:"auto", order:2, mt:3}}
                >
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={40}>40</MenuItem>
                </Select>
            </div>
            <Table sx={{mt: 1, mb:5}}>
                <TableHeader 
                    orderValue = {orderValue}
                    orderDirection = {orderDirection}
                    sortHandler={sortingHandler}
                    headerList={headerList}
                />
                <TableContent objectList={objectList} handler={rowClickHandler} headerList={headerList}/>
            </Table>
        </>
    )
}

export default CustomTable