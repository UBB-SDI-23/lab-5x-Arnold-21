import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";
import { useEffect, useState } from "react";

export default function TableHeader(props) {
    const { orderValue, orderDirection, sortHandler, headerList, aggregateHeader } = props;
    const [width, setWidth] = useState(window.innerWidth)

    useEffect(() => {
        window.addEventListener("resize", () => setWidth(window.innerWidth))
    }, [])

    return (
        <TableHead sx={{bgcolor: "lightgray", borderBottom: 3}}>
            {(width > 1250 || headerList.find(header => header === "username")) ?
            <TableRow>
                {headerList.map((header) => (
                    <TableCell key={header}>
                        <TableSortLabel 
                            active={orderValue === header}
                            direction={orderValue === header ? orderDirection : "asc"}
                            onClick={() => sortHandler(header)}
                        >
                        {header}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow> :
            <TableRow>
                    <TableCell key={headerList[0]}>
                        <TableSortLabel 
                            active={orderValue === headerList[0]}
                            direction={orderValue === headerList[0] ? orderDirection : "asc"}
                            onClick={() => sortHandler(headerList[0])}
                        >
                        {headerList[0]}
                        </TableSortLabel>
                    </TableCell>
                    {!headerList.find(header => header === "name") ?
                    <>
                        <TableCell key={aggregateHeader}>
                            <TableSortLabel 
                                active={orderValue === aggregateHeader}
                                direction={orderValue === aggregateHeader ? orderDirection : "asc"}
                                onClick={() => sortHandler(aggregateHeader)}
                            >
                            {aggregateHeader}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell key={"club1"}>
                            <TableSortLabel 
                                active={orderValue === "club1"}
                                direction={orderValue === "club1" ? orderDirection : "asc"}
                                onClick={() => sortHandler("club1")}
                            >
                            club1
                            </TableSortLabel>
                        </TableCell> 
                        <TableCell key={"club2"}>
                            <TableSortLabel 
                                active={orderValue === "club2"}
                                direction={orderValue === "club2" ? orderDirection : "asc"}
                                onClick={() => sortHandler("club2")}
                            >
                            club2
                            </TableSortLabel>
                        </TableCell> 
                    </>:
                    <>
                        <TableCell key={aggregateHeader}>
                            <TableSortLabel 
                                active={orderValue === aggregateHeader}
                                direction={orderValue === aggregateHeader ? orderDirection : "asc"}
                                onClick={() => sortHandler(aggregateHeader)}
                            >
                            {aggregateHeader}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell key={"name"}>
                            <TableSortLabel 
                                active={orderValue === "name"}
                                direction={orderValue === "name" ? orderDirection : "asc"}
                                onClick={() => sortHandler("name")}
                            >
                            Name
                            </TableSortLabel>
                        </TableCell> 
                    </>}
            </TableRow>}
          </TableHead>
    );
}