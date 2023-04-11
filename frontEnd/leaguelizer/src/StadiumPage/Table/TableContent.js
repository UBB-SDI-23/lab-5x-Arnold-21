import { TableHead, TableCell, TableRow } from "@mui/material";

export default function TableContent(props){
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