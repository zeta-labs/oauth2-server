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
    var redirectUri = req.body.redirect_uri || "",
        databaseUrl = "oauth",
        collections = ["users",'oauth_clients'],
        db = require("mongojs")(databaseUrl, collections);
    var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','x',
        'z','1','2','3','4','5','6','7','8','9','0','A','B','C','D','E','F','G','H','J','K','I','O','L','M',
        'N','O','P','Q','R','S','T','Y','U','X'];
    var clientId = "";
    for (var i = 0; i < 16;i++) {
      clientId += letters[Math.ceil(Math.random() * letters.length) -1];
    }
    var clientSecret = "";
    for (var i = 0; i < 30;i++) {
      clientSecret += letters[Math.ceil(Math.random() * letters.length) -1];
    }

    db.oauth_clients.find({client_id: clientId},function(err,client) {
      if (!client || !client.length) {
        db.oauth_clients.save({client_id : clientId, redirect_uri: redirectUri, client_secret : clientSecret},function(err,saved) {
          if (!err) {
            res.end(JSON.stringify({status: 'success', client_id : clientId, client_secret: clientSecret, msg: "User saved. Feel free to get an access token from /oauth/token now"}));
          }
        })
      }
      else {
          res.end(JSON.stringify({msg: "It seems that we're really lame. We tried giving you an already existing client id", status:'failure'}))
      }
    })
}

exports.postRegister = function(req,res) {
    var username = req.body.username || "",
        password = req.body.password || "",
        databaseUrl = "oauth",
        collections = ["users",'oauth_clients'],
        db = require("mongojs")(databaseUrl, collections);
    res.setHeader('Content-Type', 'application/json');

    if (username && username.match('^[A-Za-z0-9-_\^]{5,30}$') && password && password.length > 2) {
    db.users.find({username:username},function(err,users) {
      console.log(users);
      if (!users || !users.length) {
        db.users.save({username: username, password: password}, function(err,saved) {
          if (!err) {
            res.end(JSON.stringify({status: "success", msg: "User registered"}));
          }
        })
      }else {
        res.end(JSON.stringify({msg:"Try using another username", status:'failure'}));
      }
    })
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
  collections     = ["users"],
  db              = require("mongojs")(databaseUrl, collections),
  redirect        = null;

  res.setHeader('Content-Type', 'application/json');
  if (req.query.redirect) {
      redirect = req.query.redirect;
  }
  if (req.body.username && req.body.password) {
    var userName = req.body.username;
    var password = req.body.password;
    db.users.find({"username" : userName, password: password}, function(err,user) {
      if(err){
        console.log('[ERROR] ',err);
      }
      if (user && user.length) {
        req.session.user = {
          id: user[0]._id,
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
    })
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
