var express = require('express');
var app = module.exports = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(express.static('public'))
    // app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);


app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('sslcert/privatekey.key', 'utf8');
var certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(3443);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DB connected");
});

var pageSchema = mongoose.Schema({
    type: String,
    content: String
})

var diarySchema = mongoose.Schema({
    uname: String,
    date: {
        type: Date
    },
    content: pageSchema,
    last_modified: {
        type: Date
    },
    timer_format: String
});

var Diary = mongoose.model('Diary', diarySchema);

// magic keys
var NAMES = {
    she: "zjy",
    me: "ljc"
}

// send email
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

var start_app = {
  from: '',
  to: '',
  subject: 'My diary started',
  text: 'That was easy!'
};

app.get('/timeline', function(req, res, next) {
    res.render('timeline.html');
});

app.get('/diary', function(req, res, next) {
    console.log('Retrieving to DB');
    var d;
    Diary.find({}, function(err, diaries) {
        if (err) {
            console.log('Error loading all from db.');
            console.log(err);
            return res.json({
                success: false,
                message: 'Cannot load all from db. '
            });
        } else {
            d = diaries;
            console.log('Back from DB');
            if (!d) {
                console.log('Empty results');
            } else {
                console.log(d.length);

                var repo = [];
                for (var i = 0; i < d.length; i++) {
                    // convert this piece of diary into the desired format
                    var piece = d[i];
                    console.log('This piece: ' + JSON.stringify(piece));
                    if (piece.uname) {
                        var converted = {
                            id: piece.id,
                            uname: piece.uname,
                            date: piece.date,
                            content: piece.content,
                            last_modified: piece.last_modified,
                            timer_format: piece.timer_format
                        };
                        repo.push(converted);
                    }
                    // do not return pieces with no uname
                    else {
                        continue;
                    }
                }

                console.log(repo.length + " diaries to return");

                return res.json({
                    success: true,
                    message: 'Loaded all from db. ',
                    content: JSON.stringify(repo)
                });
            }
        }
    });
});

function check_memorial_days(){
    // today is
    var today=moment();

    Diary.find({}, function(err, diaries) {
        if (err) {
            console.log('Error loading all from db. Not able to check memorial days.');
            console.log(err);
            return res.json({
                success: false,
                message: 'Cannot load all from db. '
            });
        } else {
            d = diaries;
            console.log('Back from DB');
            if (!d) {
                console.log('Empty results');
            } else {
                console.log(d.length);

                var repo = [];
                var today=moment();
                for (var i = 0; i < d.length; i++) {
                    // convert this piece of diary into the desired format
                    var piece = d[i];
                    var the_day = moment(piece.date);
                    if(piece.timer_format){
                        console.log("This piece of diary has timer format: "+piece.timer_format);
                        console.log("The diary is from date "+piece.date);


                    }
                }

                console.log(repo.length + " diaries checked");

                return res.json({
                    success: true,
                    message: 'Loaded all from db. ',
                    content: JSON.stringify(repo)
                });
            }
        }
    });

}

app.post('/delete_diary', function(req, res, next) {
    console.log('Got delete request.');
    console.log(req.body);

    var data = req.body;
    var id = data.id;
    var uname = data.uname;


    Diary.findById(id, function(err, result) {
        if (err) {
            console.log('Error finding diary with id ' + id);
            console.log(err);
            return res.json({
                success: false,
                message: 'Error finding diary with id ' + id
            });
        } else {
            console.log('Diary to be deleted:');
            console.log(result);

            // verify if the user is correct



            Diary.deleteOne({ id: id }, function(err, ret) {
                if (err) {
                    console.log('Error deleting diary.');
                    console.log(err);
                    return res.json({
                        success: false,
                        message: 'Error finding diary with id ' + id
                    });
                } else {
                    console.log('Deleted diary');
                    console.log(ret);

                    return res.json({
                        success: true,
                        message: 'Diary deleted'
                    });
                }

            });
        }
    });


})

app.post('/diary', function(req, res, next) {
    console.log('Got post request.');
    console.log(req.body);

    var data = req.body;
    var id = data.id;
    var uname = data.uname;
    var raw_date = data.date;
    var raw_content = data.content;
    var last_modified = new Date();
    var timer_format = data.timer_format;


    console.log('Diary id is ' + id);

    // parse date
    console.log('Date: ');
    console.log(raw_date);
    var date = new Date(raw_date);
    console.log(date);

    // last modified date
    console.log('Generate last modified date: ');
    console.log(last_modified);

    // handle timer
    console.log("Timer format is "+timer_format);

    // parse contents from json and loop
    var contents = raw_content;
    console.log(contents);

    // check if the diary exists
    console.log('Check if diary exists.');
    if (id == "") {
        console.log('The diary has no id. Save it as new.');
        // save diary
        var d = new Diary({
            uname: uname,
            date: date,
            content: {
                type: 'text',
                content: contents
            },
            last_modified: last_modified,
            timer_format: timer_format
        });
        d.save(function(err) {
            if (err) {
                console.log('Error saving diary.');
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Check the error. '
                });
            } else {
                console.log('Saved diary.');
                return res.json({
                    success: true,
                    message: 'Saved diary. '
                });
            }
        });
    } else {
        var exists = Diary.findById(id, function(err, result) {
            if (err) {
                console.log('Error finding duplicate from db.');
                console.log(err);
                return res.json({
                    success: false,
                    message: 'Cannot find duplicate diary. Save failed. '
                });
            } else {
                if (!result || result.length == 0) {
                    console.log('No duplicate diary. Save new diary.');

                    // save diary
                    var d = new Diary({
                        uname: uname,
                        date: date,
                        content: {
                            type: 'text',
                            content: contents
                        }
                    });
                    d.save(function(err) {
                        if (err) {
                            console.log('Error saving diary.');
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Check the error. '
                            });
                        } else {
                            console.log('Saved diary.');
                            return res.json({
                                success: true,
                                message: 'Saved diary. '
                            });
                        }
                    });
                } else if (result.length > 1) {
                    console.log('Found ' + results.length + ' duplicates. ');
                    console.log(results);
                    return res.json({
                        success: false,
                        message: 'So many duplicates. Save failed. '
                    });
                } else {
                    console.log('Duplicate found. Update diary.');
                    console.log('New date: ' + date);
                    console.log('New content:' + contents);

                    result.date = date;
                    result.content = {
                        type: 'text',
                        content: contents
                    };
                    result.timer_format = timer_format

                    result.save(function(err, updated_diary) {
                        if (err) {
                            console.log('Error saving updated diary.');
                            console.log(err);
                            return res.json({
                                success: false,
                                message: 'Cannot update diary. '
                            });
                        } else {
                            console.log('Diary content updated to ' + updated_diary.content.content);
                            return res.json({
                                success: true,
                                message: 'Saved diary. '
                            });
                        }
                    });
                }
            }
        });

    }

});

transporter.sendMail(start_app, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});