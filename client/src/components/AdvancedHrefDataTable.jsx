import React from "react";

export function AdvancedHrefDataTable({ advancedHrefData }) {
  const links = ["internal", "external"];

  return (
    <div className="card">
      <table className="horizontal-table">
        <thead>
          <tr>
            <th></th>
            <th>URL</th>
            <th>Protocol</th>
            <th>Is Reachable</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {/* Advanced Link Data */}
          {Array.isArray(links) && links.map((linkType, j) => (
            <React.Fragment key={j}>
              {Array.isArray(advancedHrefData[linkType]) && advancedHrefData[linkType].map((v, i) => (
                <tr key={i}>
                  {i === 0 && (
                    <th rowSpan={advancedHrefData[linkType].length}>
                      {linkType} links
                    </th>
                  )}
                  <td>{v.url}</td>
                  <td>{v.protocol}</td>
                  <td>{v.isReachable ? "true" : "false"}</td>
                  <td>{v.error}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
          {/* End Advanced Link Data */}
        </tbody>
      </table>
    </div>
  );
}
