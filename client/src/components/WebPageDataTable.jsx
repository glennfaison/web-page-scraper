import React from "react";

export function WebPageDataTable({ webPageData }) {
    const links = ["internal", "external"];
    const headings = webPageData ? Object.keys(webPageData.headingData) : [];

  return <div className="card">
    <table className="horizontal-table">
      <tbody>
        {/* Miscellaneous Data */}
        <tr>
          <th>HTML DocType</th>
          <td>{webPageData.docType}</td>
        </tr>
        <tr>
          <th>Page Title</th>
          <td>{webPageData.pageTitle.trim()}</td>
        </tr>
        <tr>
          <th>Login Form Found?</th>
          <td>{webPageData.hasLoginForm ? "True" : "False"}</td>
        </tr>
        {/* End Miscellaneous Data */}
        {/* Heading Data */}
        {headings.map((headingType, j) => (
          <React.Fragment key={j}>
            {webPageData.headingData[headingType].map((url, i) => (
              <tr key={i}>
                {i === 0 && (
                  <th rowSpan={webPageData.headingData[headingType].length}>
                    {headingType}
                  </th>
                )}
                <td>{url}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
        {/* End Heading Data */}
        {/* Link Data */}
        {links.map((linkType, j) => (
          <React.Fragment key={j}>
            {webPageData.hrefData[linkType].map((url, i) => (
              <tr key={i}>
                {i === 0 && (
                  <th rowSpan={webPageData.hrefData[linkType].length}>
                    {linkType} links
                  </th>
                )}
                <td>{url}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
        {/* End Link Data */}
      </tbody>
    </table>
  </div>;
}
