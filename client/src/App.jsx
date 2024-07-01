import React, { useCallback, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "./App.css";

async function analyzeUrl(inputUrl, performDeepAnalysis = false) {
  try {
    const encodedInputUrl = encodeURI(inputUrl);
    const requestUrl = `http://localhost:3003/api/v1/analyze?performDeepAnalysis=${!!performDeepAnalysis}&url=${encodedInputUrl}`;
    const result = await fetch(requestUrl);
    return result.json();
  } catch (e) {
    throw new Error("error while analyzing URL: " + e);
  }
}

function App() {
  const [url, setUrl] = useState("https://github.com/login");
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState(null);
  const [performDeepAnalysis, setPerformDeepAnalysis] = useState(false);
  const headings = data ? Object.keys(data.headings) : [];
  const links = data ? Object.keys(data.links) : [];
  const sendRequest = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const result = await analyzeUrl(url, performDeepAnalysis);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, url, performDeepAnalysis]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Enter the URL you want to analyze and click 'Run'</h2>

        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            sendRequest();
          }}
        >
          <input
            type="url"
            defaultValue={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={isRunning}>
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
        {!!isRunning && <ProgressSpinner role="status" aria-label="Loading">
          <span className="visually-hidden">Loading...</span>
        </ProgressSpinner>}

        {!isRunning && data && (
          <div className="card">
            <table className="horizontal-table">
              <tbody>
                {/* Miscellaneous Data */}
                <tr>
                  <th>HTML DocType</th>
                  <td>{data.docType}</td>
                </tr>
                <tr>
                  <th>Page Title</th>
                  <td>{data.pageTitle.trim()}</td>
                </tr>
                <tr>
                  <th>Login Form Found?</th>
                  <td>{data.foundLoginForm ? "True" : "False"}</td>
                </tr>
                {/* End Miscellaneous Data */}

                {/* Heading Data */}
                {headings.map((headingType, j) => {
                  return (
                    <React.Fragment key={j}>
                      {data.headings[headingType].map((url, i) => {
                        return (
                          <tr key={i}>
                            {i === 0 && (
                              <th rowSpan={data.headings[headingType].length}>
                                {headingType}
                              </th>
                            )}
                            <td>{url}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* End Heading Data */}

                {/* Link Data */}
                {links.map((linkType, j) => {
                  return (
                    <React.Fragment key={j}>
                      {data.links[linkType].map((url, i) => {
                        return (
                          <tr key={i}>
                            {i === 0 && (
                              <th rowSpan={data.links[linkType].length}>
                                {linkType} links
                              </th>
                            )}
                            <td>{url}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* End Link Data */}
              </tbody>
            </table>
          </div>
        )}

        {!!data?.advancedLinkData && !isRunning && data && (
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
                {links.map((linkType, j) => {
                  return (
                    <React.Fragment key={j}>
                      {data.advancedLinkData[linkType].map((v, i) => {
                        return (
                          <tr key={i}>
                            {i === 0 && (
                              <th
                                rowSpan={data.advancedLinkData[linkType].length}
                              >
                                {linkType} links
                              </th>
                            )}
                            <td>{v.url}</td>
                            <td>{v.protocol}</td>
                            <td>{v.isReachable ? "true" : "false"}</td>
                            <td>{v.error}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* End Advanced Link Data */}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
