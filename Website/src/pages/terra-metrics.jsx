import UniversalHead from "@components/misc/UniversalHead.jsx";

import styles from "@styles/terra-metrics.module.scss";
import {mainDivClass} from "@styles/global.bootstrap.js";
import NavBar from "@components/layout/Navbar/NavBar.jsx";
import Footer from "@components/layout/Footer/Footer.jsx";
import DataTable from "@components/layout/DataTable/DataTable.jsx";
import {useEffect, useState} from "react";
import {initSocket, requestData} from "@utils/socket-util.js";
import {arduinoBoards} from "@server-lib/globals.js";

function MainContent() {
    const [data, setData] = useState({
        arduinoBoards: [
            {
                sensors: {
                    DHT11_0: {
                        temp: 0,
                        humidity: 0,
                    },
                    DHT11_1: {
                        temp: 0,
                        humidity: 0,
                    },
                }
            },
        ]
    });

    useEffect(() => {
        const cleanup = initSocket(setData);
        requestData();
        return cleanup;
    }, []);

    const sensors = data.arduinoBoards[0].sensors;

    let hotSensor, coldSensor;

    if (sensors.DHT11_0.temp > sensors.DHT11_1.temp) {
        hotSensor = sensors.DHT11_0;
        coldSensor = sensors.DHT11_1;
    } else {
        hotSensor = sensors.DHT11_1;
        coldSensor = sensors.DHT11_0;
    }


    return (
        <div className={styles.bgImgTerra}>
            <div className={styles.fgImgTerra}/>
            <div className={styles.dataTableContainer}>
                <div className={styles.innerBorder}>
                    <DataTable
                        columns={["Temperatura:", "Wilgotność:"]}
                        items={[
                            [
                                ["Najcieplejszy punkt", `${hotSensor.temp}°C`, "#eca054"],
                                ["Najzimniejszy punkt", `${coldSensor.temp}°C`, "#73ffff"],
                            ],
                            [
                                ["Najcieplejszy punkt", `${hotSensor.humidity}%`, "#eca054"],
                                ["Najzimniejszy punkt", `${coldSensor.humidity}%`, "#73ffff"]
                            ]
                        ]}
                    />
                </div>
            </div>
            <div className={styles.cameraContainer}></div>
        </div>
    )
}


function TerraMetrics() {

    return (
        <>
            {/* Head */}
            <UniversalHead/>

            {/* Body */}
            <div className={`${styles.main} ${mainDivClass}`}>
                <NavBar/>
                <MainContent/>
            </div>

            {/* Footer */}
            <Footer/>
        </>
    )
}

export default TerraMetrics;