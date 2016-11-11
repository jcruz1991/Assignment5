var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    app = express(),
    MongoClient = mongodb.MongoClient,
    redis = require('redis'),
    io = require('socket.io');

var usersOnline = {};

client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

client.set('question_ID', 0);
client.set('right', 0);
client.set('wrong', 0);

app.use(express.static(__dirname + '/public'));

// Create server & socket
server = http.createServer(app).listen(3000);
server.listen(3000);
io = io.listen(server);
console.log('Running on port http://localhost:3000/');

mongoose.Promise = global.Promise;
// Support JSON-encoded bodies
app.use(bodyParser.json());
// Support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

//Connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to Database");
});

// Home Page
app.get('/', function(req, res) {
    //res.render('index');
    res.sendFile(__dirname + '/index.html');
});

//Posting user
app.post('/users', function(req, res) {
    var user = req.body.Username;
    usersOnline.push(user);
});

// Posting new question
app.post('/question', function(req, res) {

    client.incr('question_ID', function(err, ID) {
        var collection = db.collection('questions');
        var input = {
            "Question": req.body.Question,
            "Answer": req.body.Answer,
            "_id": ID
        };

        collection.insert([input], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    'Question': input.Question,
                    'Answer': input.Answer
                });
            }
        });
    });
});


app.get('/question', function(req, res) {
    var collection = db.collection('questions');
    collection.find().toArray(function(err, questions) {
        res.send(questions[0]);
    });
});


app.post('/answer', function(req, res) {

    var collection = db.collection('questions');
    collection.find().toArray(function(err, questions) {
        var index = 0;
        var found = 0;
        while (index < questions.length && found != -1) {
            if (questions[index]._id == req.body.ID && questions[index].Answer == req.body.Answer) {
                client.incr('right', function(err, result) {});
                res.json({
                    "correct": "true"
                });
                found = -1;
            }
            index += 1;
        }

        if (found === 0) {
            client.incr('wrong', function(err, result) {});
            res.json({
                "correct": "false"
            });
        }
    });
    // cursor.forEach(function(Question) {
    //     if(Question._id == req.body.ID && Question.Answer == req.body.Answer) {
    //         client.incr('right', function(err,result) {});
    //         res.json({"correct": "true"});
    //     }
    //     else{
    //         client.incr('wrong', function(err,result) {});
    //         //res.json({"correct": "false"});
    //     }
    // });
});

app.get('/score', function(req, res) {
    client.get('right', function(err, right) {
        client.get('wrong', function(err, wrong) {
            res.json({
                "right": right,
                "wrong": wrong
            });
        });
    });
});

// Add a connect listener
io.on('connection', function(socket) {

    /*
  socket.on("join", function(username){
  usersOnline[socket.id] = username;

  io.emit("update", "You have connected to the server.");
  io.emit("update", username + " has joined the server.");
  io.emit("update-users", usersOnline);
});

socket.on("disconnect", function(){
  io.sockets.emit("update", usersOnline[socket.id] + " has left the server.");
  delete usersOnline[socket.id];
  io.sockets.emit("update-users", usersOnline);
});
*/
    socket.on('join', function(username) {
        usersOnline[socket.id] = username;
        console.log('User Connected: ', usersOnline[socket.id]);
        io.emit('username', username);
    });

    // Disconnect listener
    socket.on('disconnect', function() {
      console.log('User Disconnected: ', usersOnline[socket.id]);
      delete usersOnline[socket.id];
    });

});
