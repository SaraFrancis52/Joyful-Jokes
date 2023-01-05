const url = require('url')
const http = require('http')

//require sqlite3 add link db to the jokes database
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data/db_Jokes')

//to determine if the user has registered yet
let currentUser = ""
let currentUserRole = ""

exports.form = function(request, response) {
  //render the form page
  response.render('form', {
    title: 'Authenticate',
  })
}

exports.signin = function(request, response){
  //get the data
  let receivedData = "";
  request.on("data", function(chunk){
    receivedData += chunk
  })
  //once all the data has been received
  request.on("end", function(){
    let authorized = false;
    let dataObj = JSON.parse(receivedData);
    console.log(dataObj.user + " is trying to sign in");
    
    //go through the database looking for a matching username and password in the users table
    db.all("SELECT username, password, role FROM users", function(err, rows) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].username === dataObj.user && rows[i].password === dataObj.pass){
          authorized = true
          currentUserRole = rows[i].role
          currentUser = rows[i].username
        } 
        console.log(rows[i])
      }
      //send a response back to the client depending on if the user was found in the database
      if (authorized === false) {
        response.writeHead(200, {
          'Content-Type': "application/json",
        })
        response.end(JSON.stringify({state: "error"}))
      }
      else{
        response.writeHead(200, {
          "Content-Type": "application/json",
        });
        response.end(JSON.stringify({state: "success"}))
      }
    })
  })
}

exports.register = function(request, response){
  //get the data
  let receivedData = "";
  request.on("data", function(chunk){
    receivedData += chunk
  })
  //once all the data has been received
  request.on("end", function(){
    let dataObj = JSON.parse(receivedData);
    //create a run the sql line based on the received data
    let sql = `insert into users values ('${dataObj.user}', '${dataObj.pass}', 'guest');`
    db.run(sql);
    //set the current role to guest (used to determine if user should have access to the users page)
    currentUserRole = "guest"
    currentUser = dataObj.user
    
    //send a success message back to the client side js
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify({state: "success"}))
  })
}

exports.authorized = function(request, response){
  //render the success page for after a user has registered or signed in
  response.render('success', {
    title: 'Success!',
  })
}

exports.users = function(request, response) {
  //if the user hasn't registered/signed in, redirect them to the form
  if(currentUser === ""){
    response.redirect("http://localhost:3000/form")
  }
  console.log('USER ROLE: ' + currentUserRole)
  //render the page showing all the users only if the user's role is 'admin'
  if(currentUserRole === "admin"){
    db.all("SELECT username, password, role FROM users", function(err, rows) {
      response.render('users', {
        title: 'Users:',
        userEntries: rows
      })
    })
  }
  //otherwise, render an error message
  else{
    response.render('index', {
      title: 'Error. You need admin priviledges to see users',
    })
  }

}

exports.joke = function(request, response) {
  //if the user hasn't registered/signed in, redirect them to the form
  if(currentUser === ""){
    response.redirect("http://localhost:3000/form")
  }

  //object used when making a request to the API
  let options = {
    host: 'official-joke-api.appspot.com',
    path: '/jokes/random'
  }

  //make a request to the API
  http.request(options, function(apiResponse) {
    let joke = ''
    apiResponse.on('data', function(chunk) {
      joke += chunk
    })
    //once all the data has been recived render the joke page based on the response from the API
    apiResponse.on('end', function() {
      let parsedJoke = JSON.parse(joke)
      response.render('joke', {
        title: 'Joke',
        id: parsedJoke.id,
        type: parsedJoke.type,
        question: parsedJoke.setup,
        answer: `<input type="button" id="answer_button" value="${parsedJoke.punchline}"/>`,
        button: `<input type="button" class="button" id="add_button" value="Add Joke"/>`,
      })
    })
  }).end()
}

exports.addJoke = function(request, response){
  //parse the URL and extract the question and response from the path
  //need to replace things like "%20" with spaces as they were encoded when the joke was passed through the URL
  let urlObj = parseURL(request, response)
  let fullPath = urlObj.path
  
  //Question
  let question = fullPath.substring(fullPath.indexOf("+") + 4, fullPath.lastIndexOf("+"))
  question = question.replaceAll('%20', " ");
  question = question.replaceAll('%27', "'");
  question = question.replaceAll('%E2%80%99', "'")
  console.log("the question is " + question)

  //Answer
  let answerButton = fullPath.substring(fullPath.lastIndexOf("+") + 1, fullPath.length-1)
  let answer = answerButton.substring(answerButton.lastIndexOf("=") + 4, answerButton.length-5)
  answer = answer.replaceAll('%20', " ");
  answer = answer.replaceAll('%27', "'");
  answer = answer.replaceAll('%E2%80%99', "'")
  console.log("the answer is " + answer)

  let sql = `insert into saved values ('${currentUser}', '${question}', '${answer}');`
  db.run(sql);
}

function parseURL(request, response) {
  const PARSE_QUERY = true //parseQueryStringIfTrue
  const SLASH_HOST = true //slashDenoteHostIfTrue
  let urlObj = url.parse(request.url, PARSE_QUERY, SLASH_HOST)
  return urlObj
}

exports.allJokes = function(request, response){
  //if the user hasn't registered/signed in, redirect them to the form
  if(currentUser === ""){
    response.redirect("http://localhost:3000/form")
  }
  //get all jokes from the database and render them to the page
  db.all("SELECT answer, savedBy, question FROM saved", function(err, rows) {
    response.render('jokes', {
      title: 'Saved Jokes',
      jokeEntries: rows
    })
  })
}