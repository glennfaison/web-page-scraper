# Web page scraper

![Landing Page](/screenshots/landing-page.png)

## Building and running the project

1.  **Install dependencies:**

    ```bash
    yarn setup
    ```
2.  **Build the project for production:**

    ```bash
    yarn build
    ```
    This will create a production build of the project in the `build` folder.
3.  **Start the development server:**

    ```bash
    yarn dev
    ```
    This will open the project in your browser at `http://localhost:3000`.

## Running the app

The app is designed to receive a URL in the field it provides, and run a crawl, the results of which are displayed in tabular form on the page.


# Architecture

- The project is a simple client-server app with Node.js in the server and React in the client
- The server exposes 2 routes:
  - `/api/v1/analyze`
  - `/api/v1/advancedLinkData/:id`
- I decided to not cache responses for long. The assumption was that if the crawl was requested a second time in quick notice, then the page must have changed
