import Head from 'next/head';
import Link from "next/link";
import {Meta} from "next/dist/lib/metadata/generate/meta";

function UniversalHead() {
    return (
        <>
            <Head>
                <title>JAVR Domain</title>
                <meta charSet="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" type="image/x-icon" href="/img/favicon.ico"/>
            </Head>
        </>
    )
}

export default UniversalHead;