const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const hbs = require('hbs')

//read routes modules
const routes = require('./routes/index')

const  app = express()

const PORT = process.env.PORT || 3000

//tell hbs where to find the partials
hbs.registerPartials(__dirname + '/views/partials')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

//middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use('/html', express.static(__dirname + '/html'))
app.use('/public', express.static(__dirname + '/public'))


//routes
app.get('/users', routes.users)
app.get('/joke', routes.joke)
app.get('/addJoke/*', routes.addJoke)
app.get('/allJokes', routes.allJokes)
app.get('/form', routes.form)
app.get('/success', routes.authorized)
app.post('/signin', routes.signin)
app.post('/register', routes.register)

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop\n`)
		console.log('****** ADMIN ACCOUNT ******')
		console.log('user: Sara password: myPass\n')

		console.log('To Test:')
		console.log('http://localhost:3000/form')

		console.log('\nAfter signing in:')
		console.log('http://localhost:3000/joke')
		console.log('http://localhost:3000/allJokes')
		console.log('http://localhost:3000/users (admin only)')
	}
})