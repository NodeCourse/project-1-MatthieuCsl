const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./database');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//Strategie d'authentification
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const COOKIE_SECRET = 'cookie secret';

passport.use(new LocalStrategy((email, password, done) => {
  db.User
    .findOne({ where: { email, password } })
    .then(function (user) {
        // User found
        return done(null, user);
    })
    // If an error occured, report it
    .catch(done);
    }));

//identification de l'utilisateur
passport.serializeUser((user, cb) => {
    // Save the user's email in the cookie
    cb(null, user.email);
});
passport.deserializeUser((email, cb) => {
    // Get a user from a cookie's content: his email
    db.User
        .findOne({ where: { email } })
        .then((user) => {
            cb(null, user);
        })
        .catch(cb);
});

// Use Pug to render views
app.set('view engine', 'pug');

app.use(cookieParser(COOKIE_SECRET));

app.use(bodyParser.urlencoded({ extended: true }));
// Serve assets from the public folder
app.use(express.static('public'));

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req,res) => {
  db.Article
    .sync()
    .then(() => {
      return db.Article.findAll();
    })
    .then((articles) => {
      res.render('homepage', {
        articles: articles,
        user: req.user
      });
    });
});

app.get('/register', (req,res) => {
      res.render('register', { user: req.user });
});

app.post('/homepage', passport.authenticate('local', { successRedirect: '/login',
                                                    failureRedirect: '/register' }));

app.get('/login', (req,res) => {
      res.render('login', { user: req.user });
});

app.get('/lastReviews', (req,res) => {
  db.Article
    .sync()
    .then(() => {
      return db.Article.findAll({ include: [db.User]});
    })
    .then((articles) => {
      res.render('lastReviews', {
        articles: articles,
        user: req.user
      });
    });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/articleDetail/:articleId', (req,res) => {
  db.Article
    .sync()
    .then(() => {
      return db.Article.findOne({ include: [db.User],
        where: { id:  req.params.articleId }});
    })
    .then((article) => {
      res.render('articleDetail', {
        article: article,
        user: req.user
      });
    });
});
//creation de la route post pour un user
app.post('/api/user', (req, res) => {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;

  db.User
    .create({ fullname, email, password })
    .then((user) => {
      req.login(user, () => {
          res.redirect('/login');
      });
    });
});

//creation de la route post pour un article
app.post('/api/article', (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const content = req.body.content;
  const photo = req.body.image;
  const note = req.body.group1;

  db.Article
    .create({
      title: title,
      description: description,
      content: content,
      photo: photo,
      userId: req.user.id,
      note: note
     })
    .then(() => {
      res.redirect('/lastReviews');
    });
});

db.db.sync().then(() => {
  app.listen(3000);
});
