var pgConn = 'postgres://postgres:postgres@localhost/oauth'
    pg     = require('pg');

exports.quoteAPI = function(req,res, id) {
  var fs = require("fs");
  res.setHeader('Content-Type', 'application/json');
  fs.readFile("quotes/quotes.txt",function(err,data) {
    if (err || !data) {
      res.end("Please come back later");
    }
    var allQuotes = data.toString().split("#");
    var quote;
    if (id) {
      if ( id < allQuotes.length && id >= 0) {

          quote = allQuotes[id];
      }
      else {
         return res.end(JSON.stringify({status: 'failure', 'msg' : 'Unexisting id'}));
      }
    }else {
      quote = allQuotes[Math.ceil(Math.random() * allQuotes.length) - 1];
    }

    quote = quote.split("\r\n\r\n");
    var movieTitle = quote[0];
    quote.shift();
    quote = quote.join("\r\n\r\n");
    var ret = JSON.stringify({quote: quote, movieTitle: movieTitle });

    res.end(ret);
  })
};

exports.getQuoteRandom = function(req,res) {
    exports.quoteAPI(req,res,false);
};

exports.getQuoteById = function(req,res) {
  var id = req.params.id;
  if (id.match("^[0-9]+$")) {
    exports.quoteAPI(req,res,id);
  }
  else {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({status: 'failure', 'msg' : 'Bad value for id'}));
  }
};

exports.getAToken = function(req,res) {
  var model       = module.exports,
      connString  = process.env.DATABASE_URL,
      databaseUrl = "oauth",
      collections = ['oauth_access_tokens', 'oauth_clients', "oauth_refresh_tokens", "users"],
      db          = require("mongojs")(databaseUrl, collections);

  var fs = require("fs");
  fs.readFile('views/authenticate.html',function(err,data) {
    if (err || !data) {
        console.log(err);
    }
    res.end(data);
  })
}

exports.getRegister = function(req,res) {
  var fs = require("fs");
  fs.readFile("views/register.html",function(err,data) {
    if (err || !data) {
      console.log("View not found!");
    }
    res.end(data);
  })
};

exports.getClientRegister = function(req,res) {
  var fs = require("fs");
  fs.readFile("views/getClient.html",function(err,data) {
    if (err || !data) {
      console.log("View not found!");
    }
    res.end(data);
  })
};

exports.postClientRegister = function(req,res) {
    var redirectUri = req.body.redirect_uri || "";

    pg.connect(pgConn, function(err, client, done) {
      if (err) {
        return console.error('pg connection error ', err);
      }
      client.query('INSERT INTO clients(redirect_uri) VALUES ($1) RETURNING id, secret;', [redirectUri], function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }

        var client = result.rows[0];
        res.end(JSON.stringify(
          {
            client_id : client.id,
            client_secret: client.secret,
            redirect_uri: client.redirect_uri
          }
        ));
      });
    });
}

exports.postRegister = function(req,res) {
    var username = req.body.username || "",
        password = req.body.password || "";

    res.setHeader('Content-Type', 'application/json');

    if (username && username.match('^[A-Za-z0-9-_\^]{5,30}$') && password && password.length > 2) {
      pg.connect(pgConn, function(err, client, done) {
        if (err) {
          return console.error('pg connection error ', err);
        }
        client.query('INSERT INTO users(username, password) VALUES ($1, $2);', [username,password], function(err, result) {
          done();
          if(err) {
            return console.error('error running query', err);
          }
          res.end(JSON.stringify({status: "success", msg: "User registered"}));
        });
      });
    }else {
      res.end(JSON.stringify({msg:"Username does not meet the required format or password/redirect uri are too short.", status:'failure'}));
    }
};

exports.login = function(req,res) {
    var clientId = req.query.client_id || "";
    var redirectUri = req.query.redirect_uri || "";
    req.session.clientId = clientId;
    req.session.redirectUri = redirectUri;
    console.log(clientId);
    var fs = require("fs");
    fs.readFile('views/login.html',function(err,data) {
      if (err || !data) {
        res.end("Please try logging in again later.");
      }
      res.end(data);
    })
};

exports.postLogin = function(req,res) {

  var databaseUrl = "oauth",
  // collections     = ["users"],
  // db              = require("mongojs")(databaseUrl, collections),
  redirect        = null;

  res.setHeader('Content-Type', 'application/json');
  if (req.query.redirect) {
      redirect = req.query.redirect;
  }
  if (req.body.username && req.body.password) {
    var userName = req.body.username;
    var password = req.body.password;

    pg.connect(pgConn, function(err, client, done) {
      if (err) {
        return console.error('pg connection error ', err);
      }
      client.query('SELECT * FROM users WHERE username = $1 AND password = $2;', [userName,password], function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        var user = result.rows;
        if (user && user.length) {
          req.session.user = {
            id: user[0].id,
            user: userName
          }
          if (redirect && req.session.clientId) {
            res.writeHead(307, {
              'Location': redirect + "?response_type=code&client_id=" + req.session.clientId + "&redirect_uri=" +
              (req.session.redirectUri ? req.session.redirectUri : "")
            });
            res.end();
          }
          res.end("Logged in ");
        }else {
            res.end(JSON.stringify({msg: "Invalid username or password combination", 'status' : 'failure'}));
        }
      });
    });
  }else {
    res.end(JSON.stringify({msg: "No user credentials provided", 'status' : 'failure'}))
  }
}

exports.home = function(req,res) {

    var fs = require("fs");
    fs.readFile('views/index.html', function(err,data) {
        if (err || !data) {
            res.end("Please come again later.");
        }
        res.end(data);
    })
};

exports.getUserQuotes = function(req,res) {

    if (req.query.access_token) {
        //TODO: get user quotes


    }

    else {
        //TODO: get token from the authorization header, view the data in the database and show user's quotes
    }

    function findToken(token) {}
}

exports.addUserQuote = function(req,res) {

    if (req.query.access_token) {
        //TODO: get user quotes


    }

    else {
        //TODO: get token from the authorization header, view the data in the database and add the quote
    }

    function findToken(token) {}
}
