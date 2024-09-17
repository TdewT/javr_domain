import {serverTypes, ServiceTypes, StatusIndicators} from "@server-lib/globals.js";
import React, {useContext} from "react";
import {ServicesContext} from '@pages/services.jsx';
import ServiceButton from "@components/ui/ServicesButtons/ServiceButton.jsx";

import styles from "./ServicesLists.module.scss";

const tableClasses = `${styles.servicesTable} table table-responsive`;
const tbodyClasses = "align-middle text-center";

function TableElement(data) {
    const service = data.service;
    const type = data.type;
    return (
        <>
            <tr>
                <td>
                    <span className={`${styles.statusIndicator} me-2`}>
                        {StatusIndicators[service.status]}
                    </span>
                    <span className={styles.statusText}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                </td>
                <td>{service.htmlID}</td>


                <td>
                    {/*Check if service is generic server (since that's the only one rendered without buttons)*/}
                    {type === ServiceTypes.SERVER && service.type === serverTypes.GENERIC ? (
                        <div>Unavailable</div>
                    ) : (
                        <span>
                        <ServiceButton serviceType={type} serviceID={service.htmlID} purpose="start"/>
                        <ServiceButton serviceType={type} serviceID={service.htmlID} purpose="stop"/>
                    </span>
                    )
                    }
                </td>
            </tr>
        </>
    )
}

function ManagerList() {
    const services = useContext(ServicesContext);
    let managers = [];
    if (services) {
        managers = services.serverManagers || [];
    }
    if (managers.length !== 0) {
        return (
            <table id="manager-list" className={`${tableClasses} mt-5`}>
                <tbody className={tbodyClasses}>
                <tr>
                    <th colSpan={4}>Server Managers</th>
                </tr>
                <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th colSpan={2}>Interact</th>
                </tr>
                {managers.map((manager, index) => (
                    <TableElement key={index} service={manager} type={ServiceTypes.SERVER_MANAGER}/>
                ))}
                </tbody>
            </table>
        );
    }
}

function ServerList() {
    const services = useContext(ServicesContext);
    let servers = [];
    if (services) {
        servers = services.servers || [];
    }
    if (servers.length !== 0) {
        return (
            <>
                {/*TODO: Check if all classes are required*/}
                <table id="service-list" className={tableClasses}>
                    <tbody className={tbodyClasses}>
                    <tr>
                        <th colSpan={4}>Servers</th>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th colSpan={2}>Interact</th>
                    </tr>
                    {servers.map((server, index) => (
                        <TableElement key={`${index}-server`} service={server} type={ServiceTypes.SERVER}/>
                    ))}
                    </tbody>
                </table>
            </>
        )
    }
}

function DiscordBotList() {
    const services = useContext(ServicesContext);
    let discordBots = [];
    if (services) {
        discordBots = services.discordBots || [];
    }
    if (discordBots.length !== 0) {
        return (
            <>
                {/*TODO: Check if all classes are required*/}
                <table id="service-list" className={tableClasses}>
                    <tbody className={tbodyClasses}>
                    <tr>
                        <th colSpan={4}>Discord Bots</th>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th colSpan={2}>Interact</th>
                    </tr>
                    {discordBots.map((discordBot, index) => (
                        <TableElement key={`${index}-dbot`} service={discordBot} type={ServiceTypes.DISCORD_BOT}/>
                    ))}
                    </tbody>
                </table>
            </>
        )
    }
}

export {ManagerList, ServerList, DiscordBotList};