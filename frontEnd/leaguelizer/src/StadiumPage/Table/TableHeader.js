import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";

export default function TableHeader(props) {
    const { orderValue, orderDirection, sortHandler } = props;

    return (
        <TableHead sx={{bgcolor: "lightgray", borderBottom: 3}}>
            <TableRow>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "name"}
                        direction={orderValue === "name" ? orderDirection : "asc"}
                        onClick={() => sortHandler("name")}
                    >
                    Name
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "city"}
                        direction={orderValue === "city" ? orderDirection : "asc"}
                        onClick={() => sortHandler("city")}
                    >
                    City
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "buildDate"}
                        direction={orderValue === "buildDate" ? orderDirection : "asc"}
                        onClick={() => sortHandler("buildDate")}
                    >
                    Built Date
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "renovationDate"}
                        direction={orderValue === "renovationDate" ? orderDirection : "asc"}
                        onClick={() => sortHandler("renovationDate")}
                    >
                    Renovation Date
                    </TableSortLabel>
                </TableCell>
                <TableCell>
                    <TableSortLabel 
                        active={orderValue === "capacity"}
                        direction={orderValue === "capacity" ? orderDirection : "asc"}
                        onClick={() => sortHandler("capacity")}
                    >
                    Capacity
                    </TableSortLabel>
                </TableCell>
            </TableRow>
          </TableHead>
    );
}