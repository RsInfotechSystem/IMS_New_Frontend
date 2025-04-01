import React, { useMemo } from "react";
import { useTable, useSortBy, useGroupBy, useFilters } from "react-table";

// Define a simple default column filter
const DefaultColumnFilter = ({
    column: { filterValue, preFilteredRows, setFilter }
}) => {
    const count = preFilteredRows.length;
    return (
        <input
            value={filterValue || ""}
            onChange={(e) => setFilter(e.target.value || undefined)}
            placeholder={`Search ${count} records...`}
        />
    );
};

const CustomTableRenderer = ({ data, columns }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setFilter,
        state: { groupBy }
    } = useTable(
        {
            columns,
            data,
            initialState: {
                groupBy: [] // Starting with no groups
            },
            defaultColumn: {
                Filter: DefaultColumnFilter
            }
        },
        useFilters, // Enable filtering functionality
        useGroupBy, // Enable grouping functionality
        useSortBy // Enable sorting functionality
    );

    return (
        <div>
            {/* Group By Dropdown */}
            <div>
                <label>Group By: </label>
                <select onChange={(e) => setGroupBy([e.target.value])}>
                    <option value="">None</option>
                    {columns.map((col) => (
                        <option key={col.accessor} value={col.accessor}>
                            {col.Header}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table Display */}
            <table {...getTableProps()} className="pvtTable">
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()} {...column.getSortByToggleProps()}>
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? " 🔽"
                                                : " 🔼"
                                            : ""}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render("Cell")}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTableRenderer;
