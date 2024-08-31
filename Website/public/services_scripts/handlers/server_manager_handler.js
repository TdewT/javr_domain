function syncServerManager(serverManagers) {
    for (const serverManager of serverManagers) {
        const managerElement = $(`#${serverManager[0]}-status-box`);
        if (!managerElement) {
            createManagerElement(serverManager);
        }
        else{
            updateManager(serverManager);
        }
    }
}
function createManagerElement(manager) {
    const managerID = manager[0];
    const managerStatus = manager[1];

    const serviceList = $(`#manager-list`);

    const managerElement = document.createElement("li");
    managerElement.className = "list-group-item d-flex";
    managerElement.innerHTML = `
    <div id="${managerID}-status-box" class="flex">
        <span class="me-3.5" id="${managerID}-status">${statusIndicators[managerStatus]}</span>
        <span class="me-4" id="${managerID}-status-text">${getStatusText({type: 'serverManager', status: managerStatus})}</span>
    </div>
    <span>${managerID.replaceAll('_', " ")}</span>
    <button type="button" class="button btn btn-success btn-sm services-button" id="${managerID}-button-start">START</button>
    `;

    serviceList.append(managerElement);

    const statusButton = $(`#${managerID}-button-start`);
        statusButton.addEventListener('click', () => {
        socket.emit('start_server_manager_request', managerID);
    });
}
function updateManager(manager) {
    const managerID = manager[0];
    const managerStatus = manager[1];

    // Get relevant elements
    const indicatorElement = $(`#${managerID}-status`);
    const statusTxtElement = $(`#${managerID}-status-text`);

    // Change values
    indicatorElement.innerText = statusIndicators[managerStatus];
    statusTxtElement.innerText = getStatusText({type: 'serverManager', status: managerStatus});
}