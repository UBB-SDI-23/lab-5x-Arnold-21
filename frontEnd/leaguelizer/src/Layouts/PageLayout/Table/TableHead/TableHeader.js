import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";

export default function TableHeader(props) {
    const { orderValue, orderDirection, sortHandler, headerList } = props;

    return (
        <TableHead sx={{bgcolor: "lightgray", borderBottom: 3}}>
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
            </TableRow>
          </TableHead>
    );
}