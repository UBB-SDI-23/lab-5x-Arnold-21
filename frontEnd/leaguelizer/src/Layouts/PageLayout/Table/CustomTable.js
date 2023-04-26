import React, { useCallback, useEffect, useState } from 'react'
import { Table, Button, Select } from "@mui/material";
import TableHeader from "./TableHead/TableHeader";
import TableContent from "./TableBody/TableContent";

function CustomTable(props) {
    const { orderValue, orderDirection, sortingHandler, headerList, rowClickHandler, objectList, pageDown, pageUp, pageMax, pageNumber, setPageNumber, paginationOptions, paginationHandler } = props;

    const [ buttons, setButtons] = useState([]);

    const pageNumberHandler = useCallback((e) => {
        setPageNumber(e.target.value);
    }, [setPageNumber]);

    useEffect(() => {if (pageNumber >= 2 && pageNumber <= 6) {
        let varButtons = []
        for (let i=pageNumber; i<pageNumber+3; i++){
            if (i > 3){
                varButtons.push(<Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={i}>{i}</Button>);
            }
        }

        if (pageNumber >= 7) {
            varButtons.push(<Button variant="outlined" sx={{mt:3, width:2, height:2}}>...</Button>);
            for (let i=pageNumber-3; i<pageNumber+3; i++){
                varButtons.push(<Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={i}>{i}</Button>);
            }
            varButtons.push(<Button variant="outlined" sx={{mt:3, width:2, height:2}}>...</Button>);
        }
        setButtons(varButtons);
    }}, [setButtons, pageNumber, setPageNumber, pageNumberHandler]);

    return (
        <>
            <div style={{display:"flex", justifyContent:"flex-start"}}>
                <Button variant="outlined" onClick={pageDown} sx={{mt:3, width:4}}>Previous Page</Button>
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={1}>1</Button>
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={2}>2</Button>
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={3}>3</Button>
                {buttons}
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={pageMax - 2}>{pageMax - 2}</Button>
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={pageMax - 1}>{pageMax - 1}</Button>
                <Button variant="outlined" onClick={pageNumberHandler} sx={{mt:3, width:2, height:2}} value={pageMax}>{pageMax}</Button>
                <Button variant="outlined" onClick={pageUp} sx={{mt:3, width:4}}>Next Page</Button>
                <Select
                    value={paginationOptions}
                    label="Items per page"
                    onChange={paginationHandler}
                >

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