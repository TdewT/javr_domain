import Head from 'next/head';
import Link from "next/link";
import {Meta} from "next/dist/lib/metadata/generate/meta";

function UniversalHead({children}) {
    return (
        <>
            <Head>
                <title>JAVR Domain</title>
                <link rel="icon" type="image/x-icon" href="/img/favicon.ico"/>
                {children}
            </Head>
        </>
    )
}

export default UniversalHead;