// Constants to easily refer to pages
const SPLASH = document.querySelector(".splash");
const PROFILE = document.querySelector(".profile");
const LOGIN = document.querySelector(".login");
const ROOM = document.querySelector(".room");

// Custom validation on the password reset fields
const passwordField = document.querySelector(".profile input[name=password]");
const repeatPasswordField = document.querySelector(".profile input[name=repeatPassword]");
const repeatPasswordMatches = () => {
  const p = document.querySelector(".profile input[name=password]").value;
  const r = repeatPassword.value;
  return p == r;
};

const checkPasswordRepeat = () => {
  const passwordField = document.querySelector(".profile input[name=password]");
  if(passwordField.value == repeatPasswordField.value) {
    repeatPasswordField.setCustomValidity("");
    return;
  } else {
    repeatPasswordField.setCustomValidity("Password doesn't match");
  }
}

passwordField.addEventListener("input", checkPasswordRepeat);
repeatPasswordField.addEventListener("input", checkPasswordRepeat);

// TODO:  On page load, read the path and whether the user has valid credentials:
//        - If they ask for the splash page ("/"), display it
//        - If they ask for the login page ("/login") and don't have credentials, display it
//        - If they ask for the login page ("/login") and have credentials, send them to "/"
//        - If they ask for any other valid page ("/profile" or "/room") and do have credentials,
//          show it to them
//        - If they ask for any other valid page ("/profile" or "/room") and don't have
//          credentials, send them to "/login", but remember where they were trying to go. If they
//          login successfully, send them to their original destination
//        - Hide all other pages

//let currentPath = window.location.hash; 
//const isAuthenticated = sessionStorage.getItem('isAuthenticated'); 

//document.addEventListener('DOMContentLoaded', function() {
//    handleNavigation(currentPath);
//});

//function handleNavigation(path) {
//    document.querySelectorAll('.container').forEach(container => container.style.display = 'none');
//    
//    if(path === '#/' || path === '') {
//        document.querySelector('.splash').style.display = 'block';
//    } else if(path === '#/login') {
//        if(isAuthenticated) {
//            window.location.hash = '/'; 
//            handleNavigation('#/');
//        } else {
//            document.querySelector('.login').style.display = 'block';
//        }
//    } else if(path === '#/profile' || path === '#/room') {
//        if(isAuthenticated) {
//            document.querySelector(path).style.display = 'block';
//        } else {
//            sessionStorage.setItem('attemptedPath', path); 
//            window.location.hash = '/login'; 
//            handleNavigation('#/login');
//        }
//    }
//}

document.addEventListener('DOMContentLoaded', () => {
  localStorage.clear();
  load_page();
});

const loginButton = document.querySelector('.alignedForm.login button');
loginButton.addEventListener('click', async (event) => {
  event.preventDefault();
  const username = document.querySelector('.login input[name="username"]').value;
  const password = document.querySelector('.login input[name="password"]').value;
  await login(username, password);
});

function load_page(){
  updateContentPlaceholdersUsername();
  const apiKey = localStorage.getItem('apiKey');
  const path = window.location.pathname;

if (!apiKey){console.log("pageload: not found apiKey")} else{console.log("pageload:", apiKey)}

  if (!apiKey) {
    if (path === '/login') {
      showPage(LOGIN);
      loginStatus();
    } else {
      showPage(SPLASH);
      showcorrectSPLASH(apiKey);
    }
  } else {
    if (path === '/profile') {
      showPage(PROFILE);
      showCorrect();
    } else if (path.startsWith('/room')) {
      showPage(ROOM);
    } else {
      showPage(SPLASH);
      showcorrectSPLASH(apiKey);
    }
  }
}

function showCorrect(){
  const username = localStorage.getItem('username');
  const usernameInput = document.querySelector('input[name="username"]');
  if (usernameInput) usernameInput.value = username;
}

function hideAll() {
  SPLASH.style.display = 'none';
  PROFILE.style.display = 'none';
  LOGIN.style.display = 'none';
  ROOM.style.display = 'none';
}

function showPage(page) {
  hideAll();
  page.style.display = 'block';
}

function showcorrectSPLASH(apikey)
{
  console.log(apikey)
  const LOGGEDIN = document.querySelector(".loggedIn"); 
  const LOGGEDOUT = document.querySelector(".loggedOut"); 
  const CREATE_BUTTON = document.querySelector(".create"); 
  const SIGNUP_BUTTON = document.querySelector(".signup"); 

  LOGGEDOUT.style.display = 'none';
  LOGGEDIN.style.display = 'none';
  CREATE_BUTTON.style.display = 'none';
  SIGNUP_BUTTON.style.display = 'none'; 

  if(apikey!= null) {
    LOGGEDIN.style.display = 'block';
    CREATE_BUTTON.style.display = 'block';
    document.querySelector('.create').addEventListener('click', (event) => {
      event.preventDefault(); 
      makeNewRoom();
    });
  } else {
    LOGGEDOUT.style.display = 'block';
    document.querySelector('.loggedOut a').addEventListener('click', (event) => {
      event.preventDefault(); 
      localStorage.setItem('loginStatus', "success");
      navigateTo("/login");
    });
    SIGNUP_BUTTON.style.display = 'block';
    document.querySelector('.signup').addEventListener('click', async (event) => {
      event.preventDefault();
      signup();
    });
  }
}

async function signup(){
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('apiKey', data.api_key); 
      localStorage.setItem('username', data.name);
      localStorage.setItem('password', data.password);
      navigateTo("/profile");
    } else {
      console.error('Signup failed');
    }
  } catch (error) {
    console.error('Error during signup', error);
  }
}

function loginStatus(){
  document.querySelector('.failed').style.display = 'none';
  const loginfailed = localStorage.getItem('loginStatus');
  if (loginfailed == "failed"){
    document.querySelector('.failed').style.display = 'block';
  }
}


async function login(username, password) {

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('apiKey', data.api_key);
      localStorage.setItem('username', username);
      navigateTo("/profile");
    } else {
      localStorage.setItem('loginStatus', "failed");
      load_page();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

function makeNewRoom(){
}


// TODO:  When displaying a page, update the DOM to show the appropriate content for any element
//        that currently contains a {{ }} placeholder. You do not have to parse variable names out
//        of the curly  braces—they are for illustration only. You can just replace the contents
//        of the parent element (and in fact can remove the {{}} from index.html if you want).

//function updatePlaceholdersWithContent() {
//  const elementsWithPlaceholders = document.querySelectorAll("[data-placeholder]");

//  elementsWithPlaceholders.forEach(element => {
//      const key = element.getAttribute('data-placeholder');

//      const dynamicContent = {
//      };

//      if(dynamicContent[key]) {
//          element.textContent = dynamicContent[key];
//      }
//  });
//}
function updateContentPlaceholdersUsername() {
  document.querySelectorAll('.username').forEach(element => {
    const currentText = element.textContent;
    const username = localStorage.getItem('username'); 
    if (username) {
      const newText = currentText.replace('{{ Username }}', username);
      element.textContent = newText;
    }
  });
}


// TODO:  Handle clicks on the UI elements.
//        - Send API requests with fetch where appropriate.
//        - Parse the results and update the page.
//        - When the user goes to a new "page" ("/", "/login", "/profile", or "/room"), push it to
//          History



//document.addEventListener("DOMContentLoaded", () => {
//  updateContent();
//  setupEventListeners();
//});

//function updateContent() {
//  document.querySelectorAll("*").forEach(element => {
//      if (element.innerHTML.includes("{{") && element.innerHTML.includes("}}")) {
//          element.innerHTML = element.innerHTML.replace(/{{.*?}}/g, "Dynamic Content");
//      }
//  });
//}

//function setupEventListeners() {
//  document.querySelector("#loginButton").addEventListener("click", () => {
//      const username = document.querySelector("#username").value;
//      const password = document.querySelector("#password").value;

//      fetch("/api/login", {
//          method: "POST",
//          headers: { "Content-Type": "application/json" },
//          body: JSON.stringify({ username, password }),
//      })
//      .then(response => response.json())
//      .then(data => {
//          if (data.success) {
//              window.location.hash = "#/profile";
//              history.pushState({ page: "profile" }, "Profile", "#/profile");
 //             updateContent(); 
//          } else {
//              alert("Login failed!");
//          }
//      })
//      .catch(error => console.error("Error:", error));
//  });

//  window.addEventListener("hashchange", () => {
//      const path = window.location.hash;
//      handleNavigation(path);
//  });
//}

//function handleNavigation(path) {
//  document.querySelectorAll(".page-section").forEach(section => {
//      section.style.display = "none";
//  });

//  const sectionId = path.substring(1); 
//  const section = document.getElementById(sectionId);
//  if (section) {
//      section.style.display = "block";
//  }

//  updateContent();
//}

function navigateTo(url) {
  window.history.pushState({}, '', url);
  load_page()
}
// TODO:  When a user enters a room, start a process that queries for new chat messages every 0.1
//        seconds. When the user leaves the room, cancel that process.
//        (Hint: https://developer.mozilla.org/en-US/docs/Web/API/setInterval#return_value)

// On page load, show the appropriate page and hide the others
//let chatUpdateInterval;

//function enterRoom(roomId) {
//    if (chatUpdateInterval) clearInterval(chatUpdateInterval); 

//    chatUpdateInterval = setInterval(() => {
//        fetch(`/api/rooms/${roomId}/messages`)
//            .then(response => response.json())
//            .then(data => {
//                updateChatMessages(data.messages);
//            })
//            .catch(error => console.log("Error fetching chat messages:", error));
//    }, 100); 
//}

//function leaveRoom() {
//    if (chatUpdateInterval) {
//        clearInterval(chatUpdateInterval);
//    }
//}

//document.addEventListener("DOMContentLoaded", () => {
//  handleNavigation(window.location.hash);
//  setupEventListeners(); 
//});
