const $ = (e) => document.querySelector(e);
const socket = io('ws:///')

socket.on('connect', () => {
  socket.emit('zt_request')
})

socket.on('zt_response', data => {

  const ZtList = $('#ZT-list')

    data.forEach(member => {
      let element = document.createElement('li')
      element.className = "list-group-item d-flex"

      element.innerHTML += `<span class="me-auto" id="${member.config.id}-name">${member.name} ${member.description}</span>`
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`

      ZtList.append(element)
    })
})

