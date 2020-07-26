const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);
const app = express();
const postHandler = require("./models/posts");
const userHandler = require("./models/users");

const store = new mongoDBstore({
  uri: process.env.CONNECTIONSTRING,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "mySecretLOL",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { expires: new Date(253402300000000) },
  })
);
app.use((req, res, next) => {
  res.locals.isLoggedin = req.session.isLoggedin || false;
  next();
});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.post("/login", userHandler.login);

app.get("/register", (req, res, next) => {
  res.render("registration", { message: "" });
});

app.post("/register", (req, res, next) => {
  if (req.session.isLoggedin) {
    res.redirect("/showPost");
  }
  const username = req.body.shownName;
  const email = req.body.username;
  const password = req.body.passw;
  userHandler.findUser(email, (user) => {
    if (!user) {
      userHandler.saveUser(email, password, username, () => {
        res.redirect("/addPost");
      });
    } else {
      res.render("registration", { message: "user already registered" });
    }
  });
});

app.use("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    console.error(err);
  });
  res.redirect("addPost");
});

app.get("/addPost", (req, res, next) => {
  if (!req.session.isLoggedin) {
    return res.redirect("/login");
  }
  console.log(req.session.isLoggedin);
  res.render("form");
});

app.post("/addPost", (req, res, next) => {
  const user = req.session.user.username;
  const title = req.body.headline;
  const story = req.body.story;

  const tags = req.body.tags.split(",");
  postHandler.save(title, story, user, tags, () => res.redirect("/addPost"));
});

app.get("/post/:postId", (req, res, next) => {
  const id = req.params.postId;
  postHandler.disOne(id, (data) => {
    res.render("showOne", { data: data });
  });
});

app.get("/showPost", (req, res, next) => {
  const page = +req.query.page || 1;

  postHandler.dis(page, (data, page, nums) => {
    const prevPage = +page - 1;
    const nextPage = +page + 1;
    const numPages = Math.ceil(nums / 10);
    res.render("show", {
      data: data,
      currentPage: page,
      prevPage: prevPage,
      nextPage: nextPage,
      numPages: numPages,
    });
  });
});

app.post("/addComment", (req, res, next) => {
  if (!req.session.isLoggedin) {
    return res.redirect("/login");
  }
  const idPost = req.body.postId;
  const comment = req.body.comm;
  console.log(idPost);
  console.log(comment);
  postHandler.addComm(idPost, comment, () => {
    res.redirect("/post/" + idPost);
  });
});
app.post("/upvote", (req, res, next) => {
  const idPost = req.body.postId;
  console.log(idPost);
  postHandler.upvote(idPost, () => {
    res.status(200).json({ message: "success" });
  });
});
app.post("/downvote", (req, res, next) => {
  const idPost = req.body.postId;
  console.log(idPost);
  postHandler.downvote(idPost, () => {
    res.status(200).json({ message: "success" });
  });
});

app.get("/reset", (req, res) => {
  if (req.session.isLoggedin) {
    return res.redirect("/login");
  }
  res.render("reset");
});

app.post("/reset", (req, res, next) => {
  const email = req.body.email;
  userHandler.reset(email, () => {
    res.redirect("/login");
  });
});

app.get("/resetPassword/:token", (req, res, next) => {
  const token = req.params.token;
  userHandler.rsr(
    token,
    () => {
      res.redirect("/login");
    },
    (user) => {
      res.render("resetForm", { email: user.email, token: user.token });
    }
  );
});
app.post("/resetPassword", (req, res) => {
  const email = req.body.email;
  const token = req.body.token;
  const password = req.body.password;
  console.log(email);
  console.log(token);
  const cb = () => {
    res.redirect("/login");
  };
  const errcb = () => {
    res.redirect("/register");
  };
  userHandler.newPassword(email, token, password, cb, errcb);
});
let tag = "";
app.use("/search", (req, res, next) => {
  console.log(req.body.tag);
  tag = req.body.tag || tag;
  const page = +req.query.page || 1;

  postHandler.search(tag, page, (data, page, nums) => {
    const prevPage = +page - 1;
    const nextPage = +page + 1;
    const numPages = Math.ceil(nums / 10);
    res.render("show", {
      data: data,
      currentPage: page,
      prevPage: prevPage,
      nextPage: nextPage,
      numPages: numPages,
    });
  });
});

app.get("/", (req, res, next) => {
  const isLoggedin = req.session.isLoggedin;
  if (!isLoggedin) {
    return res.render("home.ejs");
  } else {
    const user = req.session.user;
    res.render("search", { user: user });
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("SERVER STARTED PORT: 3000");
});

//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
