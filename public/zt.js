// const request = require('request');

let formAction;

const $ = (e) => document.querySelector(e);
const socket = io('ws:///');

socket.on('connect', () => {
  socket.emit('zt_request')
});

socket.on('zt_response', data => {
  const ZtList = $('#ZT-list');
  const ZtForm = $('#ZT-form');
  // Check if list is already generated
<<<<<<< Updated upstream
  if (ZtList.children.length === 1){
    generateDataElements(data, ZtList, ZtForm);
=======
  if (ZtList.children.length === 1) {
    generateDataElements(data, ZtList);
>>>>>>> Stashed changes
  }
});


function generateDataElements(data, listElement,formElement) {
  data = data.sort(compareByName);

  data.forEach(member => {
    if (member.config.authorized === true) {
      let element = document.createElement('li');
      element.className = "list-group-item d-flex";

      element.innerHTML += `<span class="w-25" id="${member.config.id}-name">${member.name}</span>`;
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-desc">${member.description}</span>`;
      element.innerHTML += `<span class="ms-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`;

      listElement.append(element)
    }
<<<<<<< Updated upstream
    else{

      
=======
    else {
      let selectElement = $('#Select-form');

      selectElement.innerHTML += `<option value="${[member.config.id, member.name, member.description]}">${member.config.id}</option>`
>>>>>>> Stashed changes
    }

  })
}

<<<<<<< Updated upstream
function generateForm(unAuthorized, formElement){
  
  let element = document.createElement('form')
  element.method = "post"
  element.action = "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member/" + unAuthorized.config.id;

  element.innerHTML += `<ul>
                          <li>
                            <label for="name">Name:</label> <input id="name" type="text" value="name">
                          </li>
                          <li>
                            <label for="description">description:</label> <input id="description" type="text" value="description">
                          </li>
                          <li>
                            <label for="authorize">Authorize</label> <input id="authorize" type="checkbox" value="authorized"> 
                          </li>
                          <li>
                          <input type="submit">
                          </li>`;

  formElement.append(element)
}

function compareByName( a, b ) {
  if ( a.name < b.name ){
=======
function generateForm() {

  console.log('Started Creating form')
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
  formAction = "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member/" + unAuthorized[0];
  $('#name').value = unAuthorized[1];
  $('#description').value = unAuthorized[2];
}

function sendData() 
{
  let postData = {
    "name": $('#name').value,
    "description": $('#description').value,
    "config":
    {
      "authorized": true
    }
  };
  
  var clientServerOptions = {
    uri: formAction,
    body: JSON.stringify(postData),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  request(clientServerOptions, function (error, response) {
    console.log(error, response.body);
    return;
  });
}


function compareByName(a, b) {
  if (a.name < b.name) {
>>>>>>> Stashed changes
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
