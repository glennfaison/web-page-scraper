import React, { useCallback, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "./App.css";

/**
 * 
 * @param {string} inputUrl 
 * @param {boolean} performDeepAnalysis 
 * @returns {Promise<WebPageData>}
 */
async function httpGet(requestUrl) {
  try {
    const result = await fetch(requestUrl);
    return await result.json();
  } catch (e) {
    throw new Error("error while analyzing URL: " + e);
  }
}

function App() {
  const [url, setUrl] = useState("https://github.com/login");
  const [isFetchingWebPageData, setIsFetchingWebPageData] = useState(false);
  const [isFetchingAdvancedHrefData, setIsFetchingAdvancedHrefData] = useState(false);
  /** @type {[WebPageData, React.Dispatch<React.SetStateAction<WebPageData>>]} */
  const [webPageData , setWebPageData] = useState(null);
  const [performDeepAnalysis, setPerformDeepAnalysis] = useState(false);
  /** @type {[AdvancedHrefData, React.Dispatch<React.SetStateAction<AdvancedHrefData>>]} */
  const [advancedHrefData, setAdvancedHrefData] = useState(null);

  const headings = webPageData ? Object.keys(webPageData.headingData) : [];
  const links = webPageData ? Object.keys(webPageData.hrefData) : [];

  const fetchWebPageData = useCallback(async () => {
    if (isFetchingWebPageData) return;
    setIsFetchingWebPageData(true);
    let getAdvancedLinkData;
    try {
      const encodedInputUrl = encodeURI(url);
      const requestUrl = `http://localhost:3003/api/v1/analyze?performDeepAnalysis=${!!performDeepAnalysis}&url=${encodedInputUrl}`;
      const /** @type {WebPageData} */ result = await httpGet(requestUrl);
      setWebPageData(result);
      getAdvancedLinkData = result.getAdvancedLinkData;
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingWebPageData(false);
    }
    if (getAdvancedLinkData) {
      setIsFetchingAdvancedHrefData(true);
      try {
        const { advancedHrefData } = await httpGet(getAdvancedLinkData);
        setAdvancedHrefData(advancedHrefData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingAdvancedHrefData(false);
      }
    }
  }, [isFetchingWebPageData, url, performDeepAnalysis]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Enter the URL you want to analyze and click 'Run'</h2>
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            fetchWebPageData();
          }}
        >
          <input type="url" defaultValue={url} onChange={(e) => setUrl(e.target.value)} />
          <button type="submit" disabled={isFetchingWebPageData}>
            Run
          </button>
        </form>
        <label className="text-13">
          <span>Perform Advanced Analysis?</span>
          <input
            type="checkbox"
            defaultChecked={performDeepAnalysis}
            onChange={(e) => setPerformDeepAnalysis(e.target.checked)}
          />
        </label>
      </header>
      <main id="main">
        {!isFetchingWebPageData && webPageData && (
          <div className="card">
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
          </div>
        )}
        {!isFetchingWebPageData && !isFetchingAdvancedHrefData && !!advancedHrefData && (
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
        )}
        {(isFetchingWebPageData || isFetchingAdvancedHrefData) && (
          <ProgressSpinner role="status" aria-label="Loading">
            <span className="visually-hidden">Loading...</span>
          </ProgressSpinner>
        )}
      </main>
    </div>
  );  
}

export default App;

/**
 * @typedef {object} HeadingData
 * @property {string[]} h1
 * @property {string[]} h2
 * @property {string[]} h3
 * @property {string[]} h4
 * @property {string[]} h5
 * @property {string[]} h6
 */

/**
 * @typedef {object} HrefData
 * @property {string[]} internal
 * @property {string[]} external
 */

/**
 * @typedef {object} AdvancedHrefDataItem
 * @property {string} url
 * @property {string} protocol
 * @property {boolean} redirected
 * @property {boolean} isReachable
 * @property {number} status
 * @property {string} error
 */

/**
 * @typedef {object} AdvancedHrefData
 * @property {AdvancedHrefDataItem[]} internal
 * @property {AdvancedHrefDataItem[]} external
 */

/**
 * @typedef {object} WebPageData
 * @property {string} docType value from the !DOCTYPE tag
 * @property {string} pageTitle Title of the page
 * @property {HeadingData} headingData Headings on the page, from H1 to H6
 * @property {HrefData} hrefData hrefs on the page, internal and external
 * @property {boolean} hasLoginForm true if a login/signin form was found, false otherwise
 * @property {string} getAdvancedLinkData a link for the next request to get advanced data about the Hrefs
 */