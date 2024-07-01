import React from "react";
import "./index.css";

export const HorizontalTable = function HorizontalTable({ headers, rows }) {
    return (
        <table className="horizontal-table">
            <tr>
                <th>HTML DocType</th>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <th>Page Title</th>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <th>Login Form Found?</th>
                <td></td>
                <td></td>
            </tr>
        </table>
    );
}

export const Row = function Row({ field, header, body }){
    return (
        <tr>
            <th>Login Form Found?</th>
            <td></td>
            <td></td>
        </tr>
    );
}