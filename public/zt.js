let apiUrl;
let postUserID;

const $ = (e) => document.querySelector(e);
const socket = io('ws:///');

socket.on('connect', () => {
  socket.emit('zt_request')
});

socket.on('zt_response', data => {
  const ZtList = $('#ZT-list');
  const ZtForm = $('#ZT-form');
  // Check if list is already generated
  if (ZtList.children.length === 1) {
    generateDataElements(data, ZtList);
  }
});


function generateDataElements(data, listElement, formElement) {
  data = data.sort(compareByName);

  data.forEach(member => {
    if(member.config.authorized && !member.hidden) {
      let element = document.createElement('li');
      element.className = "list-group-item d-flex";

      element.innerHTML += `<span class="w-25" id="${member.config.id}-name">${member.name}</span>`;
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-desc">${member.description}</span>`;
      element.innerHTML += `<span class="ms-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`;

      listElement.append(element)

    }
    
    if (!member.hidden){
      let selectElement = $('#Select-form');
  
      let displayName = member.name + " " + member.description;
  
      if (displayName === " ") {
        displayName = member.config.id;
      }

      
      if(member.config.authorized){
        selectElement.innerHTML += `<option style="color:Green" value="${[member.config.id, member.name, member.description]}">${displayName}</option>`
      }
      else{
        selectElement.innerHTML += `<option style="color:Red" value="${[member.config.id, member.name, member.description]}">${displayName}</option>`
      }

        
    }

    })
}

function generateForm() {

  const ZtForm = $('#ZT-form');

  const ZTSelect = $('#Select-form');
  unAuthorized = ZTSelect.value.split(',');
  console.log(unAuthorized);


  if (!$('#Post-Form')) {
    let element = document.createElement('form');
    element.id = "Post-Form";
    element.innerHTML += `<ul>
                            <li>
                              <label for="name">Name:</label> <input id="name" type="text" value="${unAuthorized[1]}" >
                            </li>
                            <li>
                              <label for="description">description:</label> <input id="description" type="text" value="${unAuthorized[2]}">
                            </li>
                            <li>
                              <label for="authorize">Authorize</label> <input id="authorize" type="checkbox" value="authorized" checked disabled> 
                            </li>
                            <li>
                            <input type="button" value="Prześlij" onclick="sendData()">
                            </li>`;
    ZtForm.append(element);
  }

  element = $('#Post-Form');
  apiUrl = "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member/" + unAuthorized[0];
  postUserID = unAuthorized[0];
  $('#name').value = unAuthorized[1];
  $('#description').value = unAuthorized[2];
}

function sendData() {
  let postData =
  {
    "name": $('#name').value,
    "description": $('#description').value,
    "config":
    {
      "authorized": true
    }
  };
  console.log(postData + " " + postUserID + " " + apiUrl)
  socket.emit('zt_send_form', postData, postUserID, apiUrl)
}


function compareByName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
