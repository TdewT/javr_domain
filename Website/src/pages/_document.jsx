import {Html, Main, Head, NextScript} from "next/document";

export default function _document() {
    return (
        <>
            <Html lang={'en'} data-bs-theme="dark">
                <Head>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                          rel="stylesheet"
                          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                          crossOrigin="anonymous"/>
                </Head>
                <body>
                    <Main/>
                    <NextScript/>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                            crossOrigin="anonymous"
                            defer></script>

                </body>
            </Html>
        </>
    );
}
