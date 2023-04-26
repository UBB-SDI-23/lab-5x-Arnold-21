import React from 'react'
import { Table, Button, Select } from "@mui/material";
import TableHeader from "./TableHead/TableHeader";
import TableContent from "./TableBody/TableContent";

function CustomTable(props) {
    const { orderValue, orderDirection, sortingHandler, headerList, rowClickHandler, objectList, pageDown, pageUp, pageMax, pageNumber, setPageNumber, paginationOptions, paginationHandler } = props;

    let buttons = []

    if (pageNumber >= 2 && pageNumber <= 6) {
        for (let i=pageNumber; i<pageNumber+3; i++){
            if (i > 3){
                buttons.push(<Button variant="outlined" onClick={setPageNumber(i)} sx={{mt:3, width:2, height:2}}>{i}</Button>);
            }
        }
    }

    if (pageNumber >= 7) {
        buttons.push(<Button variant="outlined" sx={{mt:3, width:2, height:2}}>...</Button>);
        for (let i=pageNumber-3; i<pageNumber+3; i++){
            buttons.push(<Button variant="outlined" onClick={setPageNumber(i)} sx={{mt:3, width:2, height:2}}>{i}</Button>);
        }
        buttons.push(<Button variant="outlined" sx={{mt:3, width:2, height:2}}>...</Button>);
    }

    return (
        <>
            <div style={{display:"flex", justifyContent:"space-between"}}>
                <Button variant="outlined" onClick={pageDown} sx={{mt:3, width:4}}>Previous Page</Button>
                <Button variant="outlined" onClick={setPageNumber(1)} sx={{mt:3, width:2, height:2}}>1</Button>
                <Button variant="outlined" onClick={setPageNumber(2)} sx={{mt:3, width:2, height:2}}>2</Button>
                <Button variant="outlined" onClick={setPageNumber(3)} sx={{mt:3, width:2, height:2}}>3</Button>
                {buttons}
                <Button variant="outlined" onClick={setPageNumber(pageMax - 2)} sx={{mt:3, width:2, height:2}}>{pageMax - 2}</Button>
                <Button variant="outlined" onClick={setPageNumber(pageMax - 1)} sx={{mt:3, width:2, height:2}}>{pageMax - 1}</Button>
                <Button variant="outlined" onClick={setPageNumber(pageMax)} sx={{mt:3, width:2, height:2}}>{pageMax}</Button>
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