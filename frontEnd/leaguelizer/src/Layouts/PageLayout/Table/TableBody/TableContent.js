import { TableCell, TableRow, TableBody } from "@mui/material";

export default function TableContent(props){
    const objectList = props.objectList;
    const rowClickHandler = props.handler;
    const headers = props.headerList;

    return (
        <TableBody>
            {objectList.map((object) => (
                <TableRow
                    onClick = {() => rowClickHandler(object)}
                    key={object.id} 
                    sx={{":hover": {bgcolor: "lightgray", cursor: "pointer"}}}
                >
                    {headers.map((header)=> (
                        (object[header] !== null) ? 
                        ((typeof object[header] !== "object") ?
                            <TableCell key={header}>{object[header]}</TableCell> : (object[header].name !== undefined) ?
                                <TableCell key={header}>{object[header].name}</TableCell> : <TableCell key={header}></TableCell>) :
                                <TableCell key={header}></TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
}