let apiUrl;
let postUserID;

const $ = (e) => document.querySelector(e);
const socket = io('ws:///');

socket.on('connect', () => {
  socket.emit('zt_request')
});

socket.on('zt_response', data => {
  const ZtList = $('#ZT-list');
  
  // Check if list is already generated
  if (ZtList.children.length === 1) {
    generateDataElements(data, ZtList);
  }
});

//Generate site content
function generateDataElements(data, listElement) {
  data = data.sort(compareByName);

  //Generate table showing all authorised members
  data.forEach(member => {
    if (member.config.authorized && !member.hidden) {
      let element = document.createElement('li');
      element.className = "list-group-item d-flex";

      element.innerHTML += `<span class="w-25" id="${member.config.id}-name">${member.name}</span>`;
      element.innerHTML += `<span class="me-auto" id="${member.config.id}-desc">${member.description}</span>`;
      element.innerHTML += `<span class="ms-auto" id="${member.config.id}-ipAssigment">${member.config.ipAssignments[0]}</span>`;

      listElement.append(element)

    }

    //Generate options for form
    if (!member.hidden) {
      let selectElement = $('#Select-form');


      //Checking if member has name if not assigning member id as his shown name
      let displayName = member.name + " " + member.description;
      if (displayName === " ") {
        displayName = member.config.id;
      }

      //Coloring diffrent options for easier seeing (green - authorised, red - unauthorised)
      if (member.config.authorized) {
        selectElement.innerHTML += `<option class="authorised" value="${[member.config.id, member.name, member.description]}">${displayName}</option>`
      }
      else {
        selectElement.innerHTML += `<option class="unauthorised" value="${[member.config.id, member.name, member.description]}">${displayName}</option>`
      }

    }
  })
}

//Generate form with network members
function generateForm() {

  const ZtForm = $('#ZT-form');

  let memberToEdit =  $('#Select-form').value.split(',');

  if (!$('#Post-Form')) {
    let element = document.createElement('form');
    element.id = "Post-Form";
    element.innerHTML += `<ul>
                            <li>
                              <label for="name">Name:</label> <input id="name" type="text" value="${memberToEdit[1]}" >
                            </li>
                            <li>
                              <label for="description">description:</label> <input id="description" type="text" value="${memberToEdit[2]}">
                            </li>
                            <li>
                              <label for="authorize">Authorize</label> <input id="authorize" type="checkbox" value="authorized" checked disabled> 
                            </li>
                            <li>
                            <input type="button" value="Prześlij" onclick="sendData()">
                            </li>`;
    ZtForm.append(element);
  }

  apiUrl = "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member/" + memberToEdit[0];
  postUserID = memberToEdit[0];
  $('#name').value = memberToEdit[1];
  $('#description').value = memberToEdit[2];
}

//Send data to index.js where axios will send that data to ZeroTier api
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