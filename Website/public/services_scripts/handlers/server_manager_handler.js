function syncServerManager(state) {
    // Get relevant elements
    const indicatorElement = $(`#server-manager-status`);
    const statusTxtElement = $(`#server-manager-status-text`);
    const statusBtnElement = $(`#server-manager-button-start`);

    let status;
    if (state) status = 'online';
    else status = 'offline';

    // Change values
    indicatorElement.innerText = statusIndicators[status];
    statusTxtElement.innerText = status.charAt(0).toUpperCase() + status.slice(1);

    statusBtnElement.addEventListener('click', () => {
        socket.emit('start_server_manager_request');
    });
}