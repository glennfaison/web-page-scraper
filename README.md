# Web page scraper

![Landing Page](/screenshots/landing-page.png)

## Building and running the project

1.  **Install dependencies:**

    ```bash
    yarn setup
    ```
2.  **Run tests on the server:**

    ```bash
    yarn test:server
    ```
3.  **Run tests on the client:**

    ```bash
    yarn test:client
    ```
4.  **Start the development server:**

    ```bash
    yarn dev
    ```
    This will open the project in your browser at `http://localhost:3000`.

## Using the web app

The web app is designed to receive a URL in the field it provides, and run a crawl, the results of which are displayed in tabular form on the page.


# Architecture

- Follows a simple client-server setup with Node.js in the server and React in the client
- services to manage I/O resources, and routers to handle requests from the client
- to minimize time cost and improve performance, the data is to be returned to the client in 2 parts:
    - **basic information**: the doctype, page title, headings and hrefs on the page
    - **advanced information**: the in-depth analysis of each href on the page. Is the URL reachable? Does it redirect? Does it use HTTPS?
- The server exposes 2 routes:
  - `/api/v1/analyze`
      - takes the following query parameters:
          - `url` - a string. The URL that is to be analyzed.
          - `performDeepAnalysis` - a boolean value. If true, the app will explore each href found on the page. It does nothing otherwise.
      - returns an object with the basic analysis results for the page at the URL provided. If `performDeepAnalysis` true, then a URL for fetching the advanced analysis is also returned
  - `/api/v1/advancedLinkData/:id`
      - this link is provided along with the results for the basic analysis of a page
      - the `:id` is provided by the result of the first request
- The client is a basic React app that:
    - displays a textbox to receive the URL of the page to be analyzed;
    - a checkbox to set whether or not an advanced analysis should be performed;
    - and a 'Run' button to initiate the analysis
    - when the basic analysis is done, the data is displayed in tabular form and the app scrolls the table into view
    - if the user requested advanced analysis, the second request runs in the background. As such, while the user looks through the simple analysis data, the advanced analysis data is being loaded and finally displayed further down the page

# Design Decisions

## Where to do the analysis logic?

**Assumption**: we want to save the data after analysis
- I had to choose between doing the analysis on the client side or the server side
    - Pros for using the client side:
        - the computing load on the server is reduced
    - Cons for using the client side:
        - we'd be unable to use a headless browser or other crawling tool.
        - if we can't use a crawling tool, we'd need to settle with either using a simple HTTP GET call to the URL, or loading the URL in an `<iframe>`
        - my experience with iframes is that there are cases when the developer prevents the page, a section of the page, or some of its functionality, from loading in iframes. Our app may miss some data.
        - with an HTTP call, we get the page HTML, but some pages only load minimal data until the user begins scrolling down
        - an authentication setup needs to be added to verify that only accepted clients send their data to the server. This will also require extra data validation.
    - Pros for using the server side:
        - we are able to use a browser. This way we can open and scroll pages to load more data
        - we can dynamically choose whether to make an HTTP call or open a browser page in order to fetch the HTML of a page
        - no need to validate data received, or authenticate clients
        - if newer versions of the API are built, the clients don't need to change much on their end. They can even stay on the older versions.
        - much simpler to build for a demo/non-production app (haha)
    - Cons for using the server side:
        - higher performance cost on the server
- I decided to use the server side

## How to organize business logic?

- I decided that the best way to build the server was to split it into:
    - logic for the API routing that sends data to the client and receives requests
    - logic for services that perform the analysis logic
    - Singletons that manage I/O resources (e.g., the headless browser and the cache)
- Splitting the code like this also helps make it easier to test and mock

## How to detect a login form?

I found that the most common criteria for detecting login forms based solely on HTML text are:
- a form
    - with a single password field
    - with either:
        - an email field
        - or some text in the form that says 'username'/'email'
    - also some keywords like 'login', 'log in', 'signin', and 'sign in'
**Constraint**: It's possible for the pages to be in different languages, so the keywords will need to change based on the language. I don't have access to a translation API, so I hard-coded a mock translation service. The application will determine what languages to translate to by checking the language (`lang`) tags on the HTML of the crawled page.

## How to split the analysis into smaller, less time-consuming portions?

- **Situation**: If we are going to crawl a page, then make requests to each of the `href`s found on that page, the client will sometimes be waiting for very long (more often than we'd like). Also, the server will be stuck handling requests and doing work for long

- **Task**: Break the request into smaller, more manageable parts, and make some optional
- **Approach**:
    - have the server initially only do basic analysis.
    - if explicitly advanced analysis is explicitly requested, give the client a URL they can check for the result of the advanced analysis ([HATEOAS](https://en.wikipedia.org/wiki/HATEOAS))
    - if advanced analysis is requested, then continue to perform the analysis after sending the client the basic analysis data, then cache the result temporarily
- **Result**:
    - now if the client requests an advanced analysis, they receive a result much more quickly than if the server had to wait to gather all data before sending back to the client
    - the client can begin to browse through the basic analysis while the advanced analysis is being done.
    - usually the advanced analysis will be done before the client-side user has read through the basic analysis, so they don't spend much time waiting
    - with the advanced analysis being optional, performance cost on the server is reduced.
The result format can be broken down further as much as needed, as the framework for it is already set
