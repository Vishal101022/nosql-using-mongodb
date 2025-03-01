const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const mongoConnect = require("./util/database").mongoConnect;
const errorsController = require("./controllers/errors.js");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// Models
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.fetchAll()
    .then((users) => {
      if (users.length > 0 && !req.user) {
        const user = users[0];
        req.user = new User(user.username, user.email, user.cart, user._id);
      }
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

mongoConnect(() => {
  User.fetchAll()
    .then((users) => {
      if (users.length > 0) {
        return users[0];
      } else {
        const newUser = new User("vishal", "vis@example.com", { items: [] });
        return newUser.save();
      }
    })
    .then((result) => {
      app.listen(3000);
      console.log("Server is running on port 3000");
    })
    .catch((err) => console.log(err));
});
