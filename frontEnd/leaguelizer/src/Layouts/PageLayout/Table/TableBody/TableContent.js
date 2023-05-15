import { TableCell, TableRow, TableBody } from "@mui/material";
import { useState, useEffect } from "react";

export default function TableContent(props){
    const objectList = props.objectList;
    const rowClickHandler = props.handler;
    const headers = props.headerList;
    const userClickHandler = props.userClickHandler;
    const aggregateHeader = props.aggregateHeader;
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        window.addEventListener("resize", () => setWidth(window.innerWidth))
    }, [])

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