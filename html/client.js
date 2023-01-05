//form
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("login").addEventListener("click", logingIn);
  document.getElementById("register").addEventListener("click", registering);
  
});

//jokes
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("add_button").addEventListener("click", addtoDatabase);
});

function logingIn(){
  //read username and password from the page
  let username = document.getElementById("userField").value
  let password = document.getElementById("passField").value
  if(username === "" || password === ""){
    alert("Please enter a username and password")
  }
  else{
    //create an object to send to the server to check the database for the user
    let userCredentialsObj = {user: username, pass: password}
    let userCredentialsJSON = JSON.stringify(userCredentialsObj)
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        let responseObj = JSON.parse(this.responseText);
        //if the user was found in the database go to the success page
        if(responseObj.state === "success"){
          window.location.href="http://localhost:3000/success"
        }
        else{
          //otherwise, alert the user that there information was wrong and wipe the fields
          alert("Could not log you in")
          document.getElementById("userField").value = ""
          document.getElementById("passField").value = ""
        }
      }
    }
    //request to the server
    xhttp.open("POST", "/signin");
    xhttp.send(userCredentialsJSON)
  }
}

function registering(){
  //get the username and password from the webpage
  let username = document.getElementById("userField").value
  let password = document.getElementById("passField").value
  if(username === "" || password === ""){
    alert("Please enter a username and password")
  }
  else{
    //creat the object to send to the server to add the information to the database
    let userCredentialsObj = {user: username, pass: password}
    let userCredentialsJSON = JSON.stringify(userCredentialsObj)
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        let responseObj = JSON.parse(this.responseText);
        //if the user was added to the database, navigate to the success page
        if(responseObj.state === "success"){
          window.location.href="http://localhost:3000/success"
        }
        else{
          //otherwise, tell the user there was an issue
          alert("Could not register you")
          document.getElementById("userField").value = ""
          document.getElementById("passField").value = ""
        }
      }
    }
    //send the request to the server
    xhttp.open("POST", "/register");
    xhttp.send(userCredentialsJSON)
  }
}

function addtoDatabase(){
  //get the joke information off the page
  let joke = document.getElementById("joke_id");
  let jokeArray = (joke.innerHTML).split("#");
  let jokeID = jokeArray[1];
  joke = document.getElementById("question");
  jokeArray = (joke.innerHTML).split(":");
  let question = jokeArray[1];
  joke = document.getElementById("answer");
  jokeArray = (joke.innerHTML).split(":");
  let answer = jokeArray[1];
  
  //make a request to the server to add the joke to the database
  let xhr = new XMLHttpRequest()
  xhr.open('GET', `/addJoke/${jokeID}+${question}+${answer}`)
  xhr.send()
}