import React, { useCallback, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "./App.css";
import { WebPageDataTable } from "./components/WebPageDataTable";
import { AdvancedHrefDataTable } from "./components/AdvancedHrefDataTable";

/**
 * 
 * @param {string} inputUrl 
 * @param {boolean} performDeepAnalysis 
 * @returns {Promise<any>}
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
          <>
            <h1>Simple Web Page Data</h1>
            <WebPageDataTable webPageData={webPageData} />
          </>
        )}
        {!isFetchingWebPageData && !isFetchingAdvancedHrefData && !!advancedHrefData && (
          <>
            <h1>Advanced Web Page Data</h1>
            <AdvancedHrefDataTable advancedHrefData={advancedHrefData} />
          </>
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

