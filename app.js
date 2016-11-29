var WebSocketServer = require('ws').Server,
server =  new WebSocketServer({port: 8080});
var fs = require("fs");
var clients = [];
var fs = require('fs');

var musicList = fs.readdirSync('./songs');
var rate = [];
for (var i=0; i<musicList.length; i++) {
  obj = {};
  obj.like = 0;
  obj.dislike = 0;
  obj.title = musicList[i];
  rate.push(obj);
}

function sendAll(json) {
  for (var i = 0; i < clients.length; i++) {
    clients[i].send(json);
  }
}

server.on('connection', function (wss) {
  clients.push(wss);

  wss.on('message', function (data) {
    console.log(data);
  });

  wss.on('close', function () {
    var index = clients.indexOf(wss);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});


// EXPRESS API
var express = require('express')
var path = require('path')
var bodyParser = require("body-parser");
var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded());

app.get('/getSongs', function(req,res) {
  return res.send(rate);
})

app.get('/song/:id', function(req,res) {
  res.sendFile(path.join(process.cwd(), 'songs', rate[req.params.id].title))
})

app.post('/rateSong', function(req,res) {
  var _id = req.body.id;
  var _rate = req.body.rate;
  if (_rate == 1) {
    rate[_id].like+=1;
    var abc =   rate.sort(function(a, b) {
      return parseFloat(b.like) - parseFloat(a.like);
    });
    sendAll(JSON.stringify(abc));
    return res.send({success: "true"});
  } else if (_rate == -1) {
    rate[_id].dislike+=1;
    var abc =   rate.sort(function(a, b) {
      return parseFloat(b.like) - parseFloat(a.like);
    });
    sendAll(JSON.stringify(abc));
    return res.send({success: "true"});
  }
  return res.send({success: "false"})
})


app.listen(3000)
