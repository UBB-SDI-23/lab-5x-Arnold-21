import React, { useCallback, useEffect, useState } from 'react'
import { Table, Button, Select, MenuItem, Grid } from "@mui/material";
import TableHeader from "./TableHead/TableHeader";
import TableContent from "./TableBody/TableContent";
import "./Table.css"

const buttonStyle ={
    mt: 3,
    width: 2,
    height: "20px",
    mr:2,
    alignSelf: "center"
}

function CustomTable(props) {
    const { aggregateHeader,orderValue, orderDirection, sortingHandler, headerList, rowClickHandler, objectList, pageDown, pageUp, pageMax, pageNumber, setPageNumber, paginationOptions, paginationHandler, userClickHandler } = props;

    const [ buttons, setButtons] = useState([]);

    const pageNumberHandler = useCallback((e) => {
        setPageNumber(parseInt(e.target.value));
    }, [setPageNumber]);

    useEffect(() => {
        let varButtons = []
        let varNumber = parseInt(pageNumber)

        if (pageMax <= 15){
            for (let i = 1; i<=pageMax; i++){
                varButtons.push(<button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</button>);
            }
        }
        else if (varNumber >= 2 && varNumber <= 6) {
            for (let i = 4; i<varNumber + 3; i++){
                if (i > 3)
                    varButtons.push(<button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</button>);
            }
            varButtons.push(<button className='innerButton' variant="contained" sx={buttonStyle} key={"dot3"}>...</button>);
        }
        else if (varNumber >= 7) {
            varButtons.push(<button className='innerButton' variant="contained" sx={buttonStyle} key={"dot1"}>...</button>);
            for (let i=varNumber-3; i<=varNumber+3; i++){
                if (i < pageMax - 2)
                    varButtons.push(<button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={i} key={"button" + String(i)}>{i}</button>);
            }
            if (varNumber <= pageMax -7)
                varButtons.push(<button className='innerButton' variant="contained" sx={buttonStyle} key={"dot2"}>...</button>);
        }
        else{
            varButtons.push(<button className='innerButton' variant="contained" sx={buttonStyle} key={"dot5"}>...</button>);
        }
        setButtons(varButtons);
    }, [setButtons, pageNumber, setPageNumber, pageNumberHandler, pageMax]);

    return (
        <>
            <Grid container id='pageHolder'>
                <Button variant="contained" onClick={pageDown} id='prevPage'>Prev</Button>
                {(pageMax > 15) ? (
                    <>
                        <button className='innerButton' onClick={pageNumberHandler} sx={buttonStyle} value={1}>1</button>
                        <button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={2} key={"button2"}>2</button>
                        <button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={3} key={"button3"}>3</button>
                    </>
                ) : <></>}
                {buttons}
                {(pageMax > 15) ? (
                    <>
                        <button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax - 2} key={"button" + String(pageMax - 2)}>{pageMax - 2}</button>
                        <button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax - 1} key={"button" + String(pageMax - 1)}>{pageMax - 1}</button>
                        <button className='innerButton' variant="contained" onClick={pageNumberHandler} sx={buttonStyle} value={pageMax} key={"button" + String(pageMax)}>{pageMax}</button>
                    </>
                ) : <></>}
                <Button variant="contained" onClick={pageUp} id='nextPage'>Next</Button>
            </Grid>
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
            <Table sx={{mt: 1, mb:5}}>
                <TableHeader 
                    orderValue = {orderValue}
                    orderDirection = {orderDirection}
                    sortHandler={sortingHandler}
                    headerList={headerList}
                    aggregateHeader={aggregateHeader}
                />
                <TableContent objectList={objectList} handler={rowClickHandler} headerList={headerList} userClickHandler={userClickHandler} aggregateHeader={aggregateHeader}/>
            </Table>
        </>
    )
}

export default CustomTable