import {Html, Main, Head, NextScript} from "next/document";

export default function _document() {
    return (
        <>
            <Html lang={'en'} data-bs-theme="dark">
                <Head>
                    {/* Load google fonts*/}
                    <link rel="preconnect" href="https://fonts.googleapis.com"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin = "anonymous"/>
                    <link href="https://fonts.googleapis.com/css2?family=Jersey+25&display=swap" rel="stylesheet"/>
                </Head>
                <body>
                    <Main/>
                    <NextScript/>
                </body>
            </Html>
        </>
    );
}
