const $ = (e) => document.querySelector(e);
const socket = io('ws:///')

socket.on('connect', () => {
  socket.emit('zt_request')
})

socket.on('zt_response', data => {
  const ZtList = $('#ZT-list');

    data = data.sort(function(a,b){
      return a.name - b.name;
    });
    
    data.forEach(member => {
      let element = document.createElement('li')
      element.className = "list-group-item d-flex"

      element.innerHTML += `<span class="me-auto" id="${member.config.id}-name">${member.name}</span>`
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-desc">${member.description}</span>`
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`

      ZtList.append(element)
    })
})

