import React from 'react'
import { Table, Button } from "@mui/material";
import TableHeader from "./TableHead/TableHeader";
import TableContent from "./TableBody/TableContent";

function CustomTable(props) {
    const { orderValue, orderDirection, sortingHandler, headerList, rowClickHandler, objectList, pageDown, pageUp } = props;

    return (
        <>
            <div style={{display:"flex", justifyContent:"space-between"}}>
                <Button variant="outlined" onClick={pageDown} sx={{mt:3}}>Previous Page</Button>
                <Button variant="outlined" onClick={pageUp} sx={{mt:3}}>Next Page</Button>
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