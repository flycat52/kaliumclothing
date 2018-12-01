//const swal = require("sweetalert")
const express = require('express');
var app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
var flash = require('connect-flash');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var session = require('express-session');
var request = require('request');
var passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
const striptags = require('striptags');
const cacheControl = require('express-cache-controller');
const pgp = require('pg-promise')({});
pgp.pg.defaults.ssl = true;
const fs = require('fs');

// let request = require('request');
let weatherAPI = '1edecb3873ef5d18461acaa3fc9a5c0f';
let userCity = 'Wellington, NZ';
let weatherURL = `http://api.openweathermap.org/data/2.5/weather?q=${userCity}&units=metric&appid=${weatherAPI}`;

const saltRounds = 10;
const DB_CONNECTION =
  'postgres://vzfltdgxsnkodu:e26dff5f5f3891a66f355fc07862aaae6ccd5352ac0d2a78f27612b7410fd3e5@ec2-54-83-38-174.compute-1.amazonaws.com:5432/ddl95a465m2gb7';

const cn = {
  host: 'ec2-54-83-38-174.compute-1.amazonaws.com',
  port: 5432,
  database: 'ddl95a465m2gb7',
  user: 'vzfltdgxsnkodu',
  password: 'e26dff5f5f3891a66f355fc07862aaae6ccd5352ac0d2a78f27612b7410fd3e5'
};

const db = pgp(cn);
var logged = false;

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    /*cookie: {secure: true,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24
            }*/
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cacheControl({
    noCache: true,
    maxAge: 3600
  })
);

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: DB_CONNECTION,
  ssl: true
});

var facebookLogin = false;

app.engine('html', require('ejs').renderFile);
app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'html')
  .use(express.static(__dirname))
  .use(bodyParser.json())
  .use(
    bodyParser.urlencoded({
      extended: false
    })
  )
  .use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // // Request methods you wish to allow
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    // Request headers you wish to allow ,
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers'
    );
    // Pass to next layer of middleware
    next();
  });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

app.get('/product', (req, res) =>
  res.sendFile(path.join(__dirname, '/product.html'))
);

app.get('/product-detail', (req, res) =>
  res.sendFile(path.join(__dirname, '/product-detail.html'))
);

app.get('/cart', (req, res) => {
  if (!logged) res.redirect('/');
  else res.sendFile(path.join(__dirname, '/cart.html'));
});

app.get('/archive', (req, res) => {
  if (!logged || req.user[0].role !== 'A') res.redirect('/');
  else res.sendFile(path.join(__dirname, '/archive.html'));
});

app.get('/orderhistory', (req, res) => {
  if (!logged) res.redirect('/');
  else res.sendFile(path.join(__dirname, '/order-history.html'));
});

app.get('/searchresult', (req, res) =>
  res.sendFile(path.join(__dirname, '/search-result.html'))
);

// get all items
app.get('/items', async (req, res) => {
  const client = await pool.connect();
  const query = `SELECT item_id, title, price, picture, sale FROM items ORDER BY item_id; `;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1,
        data: result
      });
  });
  client.release();
});

app.get('/register', (req, res) =>
  res.sendFile(path.join(__dirname, '/register.html'))
);

app.get(
  '/user-profile',
  (req, res) => {
    if (logged) {
      res.sendFile(path.join(__dirname, '/user-profile.html'));
    } else {
      res.redirect('/'); //res.redirect('/index.html');
    }
  }
  //res.send(req.session.passport.user),
  //res.sendFile(path.join(__dirname, "/home-02.html"))//, { username: req.user })
);

app.get(
  '/user-info',
  (req, res) => res.send({ log: logged })
  //res.send(req.session.passport.user),
  //res.sendFile(path.join(__dirname, "/home-02.html"))//, { username: req.user })
);

app.get('/user', function(req, res) {
  logged = true;
  var user = req.user;
  var role = '';
  var id = '';
  if (facebookLogin) {
    email = user.email;
    user = user.username;
  } else {
    email = req.user[0].email;
    user = user[0].username;
  }
  pool.query(
    'SELECT user_id,user_role FROM users where email=$1',
    [email],
    (err, res) => {
      role = res.user_role;
      id = res.user_id;
    }
  );
  res.send({
    username: user,
    email: email,
    role: role,
    id: id
  });
});

app.get('/login-info', function(req, res) {
  res.send({
    log: logged
  });
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/', // '/index.html',
    failureFlash: true
  }),
  function(req, res) {
    //res.redirect("/user-profile");
    res.redirect('/'); // res.redirect('/index.html');
  }
);

/*callback for local authentication accepts username and password arguments, 
    which are submitted to the application via a login form.*/

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    (req, user, pass, done) => {
      loginAttempt();
      async function loginAttempt() {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          var currentAccountsData = await JSON.stringify(
            client.query(
              'SELECT username, email, password, user_role, user_id FROM users WHERE username=$1',
              [user],
              function(err, result) {
                if (err) {
                  return done(err);
                } else if (result.rows[0] == undefined) {
                  console.log("username doesn't exist");
                  done(err);
                } else {
                  bcrypt.compare(pass, result.rows[0].password, function(
                    err,
                    check
                  ) {
                    if (err) {
                      console.log('Error checking password');
                      return done(err);
                    } else if (check) {
                      logged = true;
                      return done(null, [
                        {
                          email: result.rows[0].email,
                          username: result.rows[0].username,
                          id: result.rows[0].user_id,
                          role: result.rows[0].user_role
                        }
                      ]);
                    } else {
                      //swal("Incorrect user or password", "error");
                      console.log('Incorrect user or password');
                      //res.send({msg:"Incorrect user or password", tag: 'error' })
                      return done(null, false);
                    }
                  });
                }
              }
            )
          );
        } catch (e) {
          throw e;
        }
      }
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//get item by item_id
app.get('/item/:itemid', async (req, res) => {
  const client = await pool.connect();
  const query = `SELECT item_id, title, description, price, picture, stock FROM items where item_id=${
    req.params.itemid
  }; `;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1,
        data: result
      });
  });

  client.release();
});

//get size list
app.get('/sizes', async (req, res) => {
  const client = await pool.connect();
  const query = `SELECT size_id, description FROM size order by size_id; `;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1,
        data: result
      });
  });

  client.release();
});

// get cart items
app.get('/cartitems', async (req, res) => {
  const userid = parseInt(req.user[0].id);
  const client = await pool.connect();
  const query = `select cart_id, c.item_id, i.title, i.picture, c.size_id, s.description, c.quantity, c.price
                from cart c inner join items i on c.item_id = i.item_id
                inner join size s on c.size_id = s.size_id
                where user_id = ${userid} and flag is null;`;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else {
      res.json({
        success: 1,
        data: result
      });
    }
  });

  client.release();
});

// get the number of cart items of login user
app.get('/numcartitems', async (req, res) => {
  if (!logged) res.json({ success: 0, data: 0 });
  else {
    const client = await pool.connect();
    const userid = parseInt(req.user[0].id);
    const query = `SELECT count(*) as num from cart where user_id = ${userid} and flag is null`;
    await client.query(query, (err, result) => {
      if (err)
        res.json({
          success: 0,
          error: err
        });
      else
        res.json({
          success: 1,
          data: result
        });
    });
    client.release();
  }
});

// add item to the cart
app.post('/cartitem', async (req, res) => {
  if (logged) {
    const client = await pool.connect();
    const item = req.body.item;
    const cartid = uuidv4();
    const userid = parseInt(req.user[0].id);

    const query = `insert into cart(cart_id, item_id, size_id, quantity, price, user_id)
              values('${cartid}', ${item.itemid}, ${item.sizeid}, ${
      item.quantity
    }, ${item.price},${userid} )`;
    await client.query(query, (err, result) => {
      if (err)
        res.json({
          success: 0,
          error: err
        });
      else
        res.json({
          success: 1
        });
    });

    client.release();
  } else {
    res.redirect('/');
  }
});

// delete item from the cart
app.delete('/cartitem/:cartid', async (req, res) => {
  const client = await pool.connect();
  const cartid = req.params.cartid;
  const query = `delete from cart where cart_id = '${cartid}';`;

  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1
      });
  });

  client.release();
});

// checkout items
app.post('/orders', async (req, res) => {
  const client = await pool.connect();
  const checkoutItems = JSON.parse(req.body.items);

  const orderid = uuidv4();
  const userid = parseInt(req.user[0].id);
  const orderdate = new Date(Date.now());
  let finalOrder = [];

  checkoutItems.forEach(item => {
    let checkout = {};
    checkout.order_id = orderid;
    checkout.cart_id = item.cart_id;
    checkout.item_id = item.item_id;
    checkout.size_id = item.size_id;
    checkout.quantity = item.quantity;
    checkout.total_price = item.total_price;
    checkout.archive = false;
    checkout.user_id = userid;
    checkout.order_date = orderdate;
    finalOrder.push(checkout);
  });

  const cs = new pgp.helpers.ColumnSet(
    [
      'order_id',
      'cart_id',
      'item_id',
      'size_id',
      'quantity',
      'total_price',
      'archive',
      'user_id',
      'order_date'
    ],
    {
      table: 'orders'
    }
  );

  const query = pgp.helpers.insert(finalOrder, cs);
  const updatequery =
    pgp.helpers.update(
      {
        flag: 'D'
      },
      ['flag'],
      'cart'
    ) +
    ' where user_id=' +
    userid;

  await db
    .none(query)
    .then(async data => {
      await db
        .none(updatequery)
        .then(data => {
          res.json({
            success: 1
          });
        })
        .catch(err => console.log('update error'));
    })
    .catch(err => console.log('insert error'));

  client.release();
});

// get order history by user id
app.get('/orderhistory/:userid', async (req, res) => {
  const client = await pool.connect();
  let userid;
  if (parseInt(req.params.userid) === 0) {
    userid = parseInt(req.user[0].id);
  } else {
    userid = parseInt(req.params.userid);
  }

  const query = `select i.title, s.description, o.quantity, o.total_price as price, 
                  to_char(o.order_date, 'DD/MM/YYYY HH24:MI:SS') as order_date, o.order_id, o.cart_id  
                  from orders o
                  inner join items i
                  on o.item_id = i.item_id
                  inner join size s
                  on s.size_id = o.size_id
                  where user_id=${userid} and archive='f'
                  order by order_date desc;`;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1,
        data: result
      });
  });

  client.release();
});

//register: storing name, email and password and redirecting to home page after signup
app.post('/user/create', async function(req, res) {
  var user = req.body.usernamesignup;
  await pool.query(
    'SELECT username FROM users where username=$1',
    [user],
    (err, response) => {
      if (response.rows[0]) {
        res.send({ msg: 'The username already exists', tag: 'error' });
        //res.send("The username already exists");
      } else {
        bcrypt.hash(req.body.passwordsignup, saltRounds, async function(
          err,
          hash
        ) {
          //var user = req.body.usernamesignup;
          var email = req.body.emailsignup;
          var pass = hash;
          var role = req.body.role;
          //const client = await pool.connect();

          await pool.query(
            "INSERT INTO users(username,email,password,user_role) values($1, $2, $3,'C')",
            [user, email, pass],
            (err, response) => {
              if (err) {
                console.log(err.stack);
              } else {
                //msg = "Succesfully created user!"
                res.send({ msg: 'Succesfully created user!', tag: 'succes' });
                console.log(response);
              }
            }
          );
        });
      }
    }
  );
  //res.send(msg)
});
//});

app.get('/logout', function(req, res) {
  logged = false;
  req.logout();
  res.redirect('/'); // res.redirect('/index.html');
});

/* Login using facebook*/

passport.use(
  new FacebookStrategy(
    {
      clientID: '507561953051977',
      clientSecret: '36f7f5a5ef726bda9610102f4633e160',
      callbackURL:
        'https://kaliumclothing.herokuapp.com/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails']
    },
    async function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var user = {
        email: profile.emails[0].value,
        username: profile.displayName
      };
      facebookLogin = true;
      logged = true;
      /* save if new??*/
      await pool.query(
        'SELECT username FROM users where username=$1',
        [user.username],
        (err, response) => {
          if (response.rows[0]) {
            console.log('It already exists');
            //res.send("The username already exists");
          } else {
            bcrypt.hash('', saltRounds, async function(err, hash) {
              //var user = req.body.usernamesignup;
              var email = user.email;
              var pass = hash;
              //const client = await pool.connect();
              console.log(response);
              await pool.query(
                "INSERT INTO users(username,email,password,user_role) values($1, $2, $3,'C')",
                [user.username, email, pass],
                (err, response) => {
                  if (err) {
                    console.log(err.stack);
                  } else {
                    //msg = "Succesfully created user!"
                    console.log(response);
                  }
                }
              );
            });
          }
        }
      );
      console.log(user.email);
      done(null, user);
    }
  )
);

app.get(
  '/auth/facebook',
  passport.authenticate('facebook', {
    scope: 'email'
  })
);

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/', // '/index.html',
    failureRedirect: '/' //'/index.html'
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '275384589655-7h65ha0dc86vlq6scqu0gkvicfj25oso.apps.googleusercontent.com',
      clientSecret: 'f90awMpNYxfPUIMs5iRK10fD',
      callbackURL: 'https://kaliumclothing.herokuapp.com/auth/google/callback'
    },
    async function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var user = {
        email: profile.emails[0].value,
        username: profile.displayName
      };
      facebookLogin = true;
      logged = true;
      await pool.query(
        'SELECT username FROM users where username=$1',
        [user.username],
        (err, response) => {
          if (response.rows[0]) {
            console.log('It already existed');
            //res.send("The username already exists");
          } else {
            bcrypt.hash('', saltRounds, async function(err, hash) {
              //var user = req.body.usernamesignup;
              var email = user.email;
              var pass = 'hash';
              //const client = await pool.connect();
              console.log(response);
              await pool.query(
                "INSERT INTO users(username,email,password,user_role) values($1, $2, $3,'C')",
                [user.username, email, pass],
                (err, response) => {
                  if (err) {
                    console.log(err.stack);
                  } else {
                    console.log(response);
                  }
                }
              );
            });
          }
        }
      );
      /* save if new??*/
      // console.log(user.email);
      done(null, user);
    }
  )
);

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/user-profile',
    failureRedirect: '/'
  })
);

/* Reset password */

app.get('/forgot', function(req, res, next) {
  // console.log(req.user);
  let usern = req.user[0].username;
  let userem = req.user[0].email;
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },

      function(token, done) {
        // console.log(userem);
        tok = token;
        pool.query(
          'UPDATE users set resetPasswordToken=$1,resetPasswordExpires=$2 WHERE email = $3',
          [token, Date.now() + 3600000, userem],
          (err, res) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log(res);
              done(err, token);
            }
          }
        );
        //}
        //});
      },

      function(token, user, done) {
        let smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          host: 'smtp.gmail.com',
          secure: true,
          port: 465,
          secure: true,
          auth: {
            //type: 'OAuth2',
            user: 'nataliaarias0616@gmail.com',
            pass: 'Nolimit19n'
            //clientID: '275384589655-7h65ha0dc86vlq6scqu0gkvicfj25oso.apps.googleusercontent.com',
            //clientSecret: "36f7f5a5ef726bda9610102f4633e160"
            //})
          }
        });

        var mailOptions = {
          to: userem,
          from: 'kalium-reset@kalium.com',
          subject: 'Kalium Clothing Account Password Reset',
          text:
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' +
            req.headers.host +
            '/reset/' +
            token +
            '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err, info) {
          // console.log(userem);
          if (err) {
            console.log(err);
            res.send(500, err.message);
          } else {
            console.log('Email sent');
            res.status(200).jsonp(req.body);
          }
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect('/'); //  res.redirect('/index');
    }
  );
});

app.get('/reset/:token', function(req, res) {
  // console.log(Date.now());
  let status = 'ok';
  let token = '';
  async.waterfall([
    function(done) {
      pool.query(
        'SELECT resetPasswordExpires, username FROM users  WHERE resetPasswordToken = $1',
        [req.params.token],
        (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log(res.rows[0].resetpasswordexpires);
            if (res.rows[0].resetpasswordexpires > Date.now()) {
              // console.log('Sip');
              status = 'ok';
              //res.send("The username already exists");
              done(err);
            } else {
              status = 'w';
              console.log(res.rows[0].resetpasswordexpires - Date.now());
              console.log('The token expired.');
              //res.send("expired");
              done(err, res);
            }
          }
        }
      );
      if (status == 'ok') {
        //res.sendFile(path.join(__dirname, "/reset.html"),token)
        //res.send({token: token})
        res.redirect('/reset.html');
        //res.render('index', { error: req.session.error });
        //delete res.session.error;
      } else {
        res.redirect('/'); //  res.redirect('/index.html');
        //res.sendFile(path.join(__dirname, "/index.html"))
      }
    }
  ]);
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      // console.log(req);
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        var pass = hash;
        pool.query(
          'UPDATE users set resetPasswordToken=$1,resetPasswordExpires=$2, password = $3 WHERE email = $4',
          [undefined, undefined, pass, req.body.email],
          (err, res) => {
            if (err) {
              console.log("Email doesn't exist");
              done(err, res);
              return res.redirect('/user-profile');
            } else {
              console.log(res);
              done(err);
            }
          }
        );
        res.redirect('/user-profile');
      });
    }
  ]);
});

app.get('/recommend', function(req, res) {
  request(weatherURL, function(err, response, body) {
    if (err) {
      console.log('error:', error);
    } else {
      let weather = JSON.parse(body);
      res.send({ w: weather.main.temp });
    }
  });
});

//get user list
app.get('/users', async (req, res) => {
  const client = await pool.connect();
  const query = `SELECT user_id, email FROM users; `;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else
      res.json({
        success: 1,
        data: result
      });
  });

  client.release();
});

app.put('/orderhistory/:userid', async (req, res) => {
  const client = await pool.connect();
  const cartids = "'" + JSON.parse(req.body.cartids).join("','") + "'";
  const orderids = "'" + JSON.parse(req.body.orderids).join("','") + "'";
  const userid = parseInt(req.params.userid); //selected userid
  const query = `update orders set archive = true
                            where cart_id in (${cartids})
                            and order_id in (${orderids})
                            and user_id=${userid}; `;
  // console.log('update query: ' + query);
  await client.query(query, async (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else {
      // console.log('update archive success');
      res.json({
        success: 1
      });
    }
  });

  client.release();
});

app.get('/archive/:userid', async (req, res) => {
  const client = await pool.connect();
  const time = Date.now();
  const cartids = "'" + JSON.parse(req.query.cartids).join("','") + "'";
  const orderids = "'" + JSON.parse(req.query.orderids).join("','") + "'";
  const userid = parseInt(req.params.userid); //selected userid
  const ws = fs.createWriteStream(`downloads/archive_${time}.json`);
  const query = `select * from orders
                    where user_id=${userid}
                    and cart_id in (${cartids})
                    and order_id in (${orderids})
                    and archive=true;`;

  // console.log('select query: ' + query);

  await client.query(query, (err, result) => {
    if (err) {
      // console.log(err);
      res.json({
        success: 0,
        error: err
      });
    } else {
      // console.log(result.rows);
      ws.write(JSON.stringify(result.rows));
      console.log('download archive success');
      res.json({
        success: 1
      });
    }
  });

  client.release();
});

//search
app.get('/search-result', async (req, res) => {
  const client = await pool.connect();
  let value = req.query.value;
  value = striptags(value.replace(/'/g, "\\'")).trim();
  const query = `SELECT item_id, title, price, picture, sale FROM items 
   where title ilike '%${value}%' ORDER BY item_id; `;
  await client.query(query, (err, result) => {
    if (err)
      res.json({
        success: 0,
        error: err
      });
    else {
      res.json({
        success: 1,
        data: result
      });
    }
  });
  client.release();
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
