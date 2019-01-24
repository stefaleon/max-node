const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const private = require('./private/private.js');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.dbURL || private.getMongoDBString;
const SECRET = process.env.SECRET || private.sessionSecret;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));


app.use((req, res, next) => {
  User.findById(private.superUserId)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: private.superUserName,
          email: private.superUserEmail,
          cart: {
            items: []
          }
        });
        user.save();
      }
      console.log('Current user:', `name: ${user.name}, email: ${user.email}, _id: ${user._id}`);
    });
    app.listen(PORT, process.env.IP, () => {
      console.log('Server started on port', PORT);
    });
  })
  .catch(err => console.log(err));