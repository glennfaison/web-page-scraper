import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 
 * @param {string} inputUrl 
 * @param {boolean} performDeepAnalysis 
 * @returns {Promise<any>}
 */
export async function httpGet(requestUrl) {
  try {
    const result = await fetch(requestUrl);
    return await result.json();
  } catch (e) {
    throw new Error("error while analyzing URL: " + e);
  }
}

export function useWebPageAnalysis() {
  const [url, setUrl] = useState("https://github.com/login");
  const [isFetchingWebPageData, setIsFetchingWebPageData] = useState(false);
  const [isFetchingAdvancedHrefData, setIsFetchingAdvancedHrefData] = useState(false);
  const [webPageData, setWebPageData] = useState(null);
  const [performDeepAnalysis, setPerformDeepAnalysis] = useState(false);
  const [advancedHrefData, setAdvancedHrefData] = useState(null);

  const tableDataRef = useRef(null);

  const fetchWebPageData = useCallback(async () => {
    if (isFetchingWebPageData) return;
    setIsFetchingWebPageData(true);
    setIsFetchingAdvancedHrefData(false);
    setAdvancedHrefData(null);

    let advancedLinkDataUrl;
    try {
      const encodedInputUrl = encodeURI(url);
      const requestUrl = `http://localhost:3003/api/v1/analyze?performDeepAnalysis=${!!performDeepAnalysis}&url=${encodedInputUrl}`;
      const result = await httpGet(requestUrl);
      setWebPageData(result);
      advancedLinkDataUrl = result.getAdvancedLinkData;
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingWebPageData(false);
    }
    if (advancedLinkDataUrl) {
      setIsFetchingAdvancedHrefData(true);
      try {
        const { advancedHrefData } = await httpGet(advancedLinkDataUrl);
        setAdvancedHrefData(advancedHrefData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingAdvancedHrefData(false);
      }
    }
  }, [isFetchingWebPageData, url, performDeepAnalysis]);

  useEffect(() => {
    if (webPageData && !isFetchingWebPageData) {
      tableDataRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tableDataRef, webPageData, isFetchingWebPageData]);

  return {
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
  };
}
