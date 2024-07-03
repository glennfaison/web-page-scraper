import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "./App.css";
import { WebPageDataTable } from "./components/WebPageDataTable";
import { AdvancedHrefDataTable } from "./components/AdvancedHrefDataTable";
import { useWebPageAnalysis } from "./App.hooks";


export default function App() {
  const {
    url,
    setUrl,
    isFetchingWebPageData,
    isFetchingAdvancedHrefData,
    webPageData,
    performDeepAnalysis,
    setPerformDeepAnalysis,
    advancedHrefData,
    tableDataRef,
    fetchWebPageData
  } = useWebPageAnalysis();

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
          <button type="submit" disabled={isFetchingWebPageData}>Run</button>
        </form>
        <label className="text-15">
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
            <h1 ref={tableDataRef}>Simple Web Page Data</h1>
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

