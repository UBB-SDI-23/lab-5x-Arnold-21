import { TableCell, TableRow, TableBody } from "@mui/material";
import { useState, useEffect } from "react";

//This module renders the elemments it was given with the headerlist it was given
//The logic for printing out the elements is the same as in the header
//If the screen becomes smaller, than only application specific elements will be rendered
export default function TableContent(props){
    //Getting all the elements the module needs for rendering
    const objectList = props.objectList;
    const rowClickHandler = props.handler;
    const headers = props.headerList;
    const userClickHandler = props.userClickHandler;
    const aggregateHeader = props.aggregateHeader;
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        window.addEventListener("resize", () => setWidth(window.innerWidth))
    }, [])

    // The rendering goes through all the elements gotten from element list gotten from the parent
    // For each element it creates a row, with either all the elements from the header list or only a part of it
    return (
        <TableBody>
            {objectList.map((object) => (
                <TableRow
                    onClick = {() => rowClickHandler(object)}
                    key={object.id} 
                    sx={{":hover": {bgcolor: "lightgray", cursor: "pointer"}}}
                >
                    {(width > 1250 || headers.find(header => header === "username")) ? <>
                    {headers.map((header)=> (
                        (object[header] !== null) ? 
                        ((typeof object[header] !== "object") ?
                            <TableCell key={header}>{object[header]}</TableCell> : (object[header].name !== undefined) ?
                                <TableCell key={header}>{object[header].name}</TableCell> : (object[header].username !== undefined) ?
                                <TableCell key={header} onClick={() => userClickHandler(object)}>{object[header].username}</TableCell>:
                                <TableCell key={header}></TableCell>) :
                                <TableCell key={header}></TableCell>
                    ))}</> : 
                    <>
                        <TableCell key={headers[0]}>{object[headers[0]]}</TableCell>
                        <TableCell key={aggregateHeader}>{object[aggregateHeader]}</TableCell>
                        {object["name"] ? <TableCell key="name">{object["name"]}</TableCell> : 
                            <>
                                <TableCell key={headers[1].name}>{object[headers[1]].name}</TableCell>
                                <TableCell key={headers[2].name}>{object[headers[2]].name}</TableCell>
                            </>}
                    </>}
                </TableRow>
            ))}
        </TableBody>
    );
}