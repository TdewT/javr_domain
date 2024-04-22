const $ = (e) => document.querySelector(e);
const socket = io('ws:///');

socket.on('connect', () => {
  socket.emit('zt_request')
});

socket.on('zt_response', data => {
  const ZtList = $('#ZT-list');
    
    data = data.sort(compareByName);
    

    data.forEach(member => {
      let element = document.createElement('li');
      element.className = "list-group-item d-flex";

      element.innerHTML += `<span class="w-25" id="${member.config.id}-name">${member.name}</span>`;
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-desc">${member.description}</span>`;
      element.innerHTML += `<span class="ms-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`;

      ZtList.append(element)
    })
});

//TODO: Sort By desc
function compareByName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}
