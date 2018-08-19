// for test purpose
require('./config/config')

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const moment = require('moment');
const _ = require('lodash');
const validator = require('validator');
const path = require('path');
const favicon = require('serve-favicon');

const {
    generateMessage,
    generateLocationMessage
} = require('./utils/message');
const {
    userClass
} = require('./utils/userClass');

var {
    mongoose
} = require('./db/mongoose');
var {
    authenticate
} = require('./middleware/authenticate');
var {
    User
} = require('./models/user');
var people = new userClass();

const port = process.env.PORT;
const publicPath = path.join(__dirname, '../public');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('views', publicPath + '/views');
app.set('view engine', 'hbs');
hbs.registerPartials(publicPath + '/views/partials'); // need full path here
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

// static serves static files and uses complete path
// public uses index.html prior to get '/'
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(bodyParser.json()); 
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))

// app.use((req, res, next) => {
//     res.render('maintenance.hbs');
// });


// app.use((req, res, next) => {
//     var now = new Date().toString();
//     console.log(`${now} ${req.method} ${req.url}`);
//     next();
// });

app.route('/')
    .get((req, res) => {
        res.render('home.hbs', {
            pageTitle: 'test',
            welcomeMessage: 'Welcome to the ChatApp'
        });
    })

app.post('/login', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    try {
        if (!validator.isEmail(body.email) || body.password.length < 6) {

            // pop up here

            throw new Error('not email or password too short');
        }
        var user = await User.findByCredentials(body.email, body.password);        
        if (user.tokens.length === 0) {
            var token = await user.generateAuthToken();
        } else {
            var token = user.tokens[0]['token']; // get token
        }
        // res.header('x-auth', token).redirect('/room.html');
        res.header('x-auth', token).redirect('/room/' + token);
    } catch (e) {
        console.log(e.message || e);
        res.status(400).redirect('/');
    }
})

app.route('/signup')
    .get((req, res) => {
        res.render('signup.hbs', {
            pageTitle: 'Sign-up Page',
            welcomeMessage: 'Welcome to my website'
        });
    })
    .post(async (req, res) => {
        var body = _.pick(req.body, ['email', 'username', 'password']);
        var user = new User(body);
        try {
            await user.save();
            var token = await user.generateAuthToken();
            // res.render('room.hbs', { body }, (err, html) => {
            //     res.header('x-auth', token).send(html);
            // });
            res.header('x-auth', token).redirect('/room/' + token);
        } catch (e) {
            console.log(e)
            res.status(400).send(e);
        }
    });



app.get('/logout/*', async (req, res) => {
    var username = req.originalUrl.substring(8);
    var user = await User.findOne({
        username
    });
    user.removeToken(user.tokens[0].token).then(() => {
        res.status(200).redirect('/');
    }, () => {
        res.status(400).send();
    });
})

app.get('/room/*', authenticate, (req, res) => {
    var body = req.user;
    res.render('room.hbs', {
        body
    }, (err, html) => {
        res.send(html);
    });
});

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        socket.join(params.room);
        people.removeUser(socket.id);
        people.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', people.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    })
    // io.to() to specific room, io.emit() to every user, socket.broadcast.emit to everyone except sender, socket.emit to a single user
    socket.on('createMessage', (message, callback) => {
        var user = people.getUser(socket.id);
        var receiver = people.getUserID(message.receiver);
        console.log(message, receiver);
        if (user) {
            if (!receiver) {
                console.log('public message');
                io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
            } else {
                console.log('private message');
                socket.to(receiver.id).emit('newPrivMessage', generateMessage(user.name, message.text));
                socket.emit('sendPrivMessage', generateMessage(receiver.name, message.text));
            }
        }
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = people.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        console.log('User away')
        var user = people.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', people.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });
});

server.listen(port, () => {
    console.log(`Started up at port ${port} at ${moment()}`);
})

module.exports = {
    app
};