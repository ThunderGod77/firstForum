const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const nodeMail = require("nodemailer");
const nodeMailSend = require("nodemailer-sendgrid-transport");
const transporter = nodeMail.createTransport(
  nodeMailSend({
    auth: {
      api_key: process.env.EMAILAPI,
    },
  })
);
// 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
var mongoose = require("mongoose");
const { strict } = require("assert");
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true });

const db = mongoose.connection;

const userScema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  upvotesReceived: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  token: String,
  tokenExpiry: Date,
});

const User = mongoose.model("User", userScema);

const saveUser = (email, password, username, cb) => {
  const newUser = new User({
    email: email,
    password: password,
    username: username,
  });

  newUser.save(function (err, nu) {
    if (err) {
      console.error(err);
    }
    transporter.sendMail({
      to: email,
      from: "kshitijgang76@gmail.com",
      subject: "Sign up successfull",
      html: "<h1>You have created an account at the test forum!</h1>",
    });
    console.log(nu.email + " registered");
  });
  cb();
};

const login = (req, res, next) => {
  const email = req.body.username;
  const password = req.body.passw;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      console.error(err);
    }
    if (!user || user.password !== password) {
      res.redirect("/login");
    }
    req.session.isLoggedin = true;
    req.session.user = user;
    res.redirect("/addPost");
  });
};

// const showPost = (cb)=>{
//     Post.find({}).sort({upvotes:-1}).exec((err,posts)=>{
//         if(err){
//             console.error(err);
//         }
//         cb(posts);
//     })
// }

const userOne = (email, cb) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      console.error(err);
    }
    cb(user);
  });
};

const resetPassword = (email, cb) => {
  var token;
  User.findOne({ email: email })
    .then((userReset) => {
      console.log(userReset.email);
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          cb();
        } else {
          token = buffer.toString("hex");
          transporter
            .sendMail({
              to: email,
              from: "kshitijgang76@gmail.com",
              subject: "You have requested to reset your password.",
              html: `<p>You have requested to reset the password</p>
                            <p>To reset click <a href="http://localhost:8080/resetPassword/${token}">here</a></p>`,
            })
            .then((err) => {
              console.log(err);
              userReset.token = token;
              userReset.tokenExpiry = Date.now() + 3600000;
              return userReset.save();
            })
            .then((result) => {
              cb();
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      cb();
    });
};

const resetPasswordRenderer = (token, errcb, con) => {
  User.findOne({ token: token, tokenExpiry: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return errcb();
      }
      con(user);
    })
    .catch((err) => {
      console.log(err);
      errcb();
    });
};

const newPassword = (email, token, password, cb, errcb) => {
  User.findOne({ token: token, email: email, tokenExpiry: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return errcb();
      }
      user.password = password;
      user.token = undefined;
      user.tokenExpiry = undefined;
      user
        .save()
        .then((result) => {
          cb();
        })
        .catch((err) => {
          console.log(err);
          return errcb();
        });
    })
    .catch((err) => {
      console.log(err);
      errcb();
    });
};

const upvote = (userName, cb) => {
  User.findOneAndUpdate(
    { username: userName },
    { $inc: { upvotesReceived: 1 } },
    { new: true }
  )
    .then((result) => {
      console.log("done");
      cb();
    })
    .catch((err) => {
      return console.log(err);
    });
};

// const addComment = (postId,comm,cb)=>{
//     Post.updateOne(
//         { _id: postId },
//         { $addToSet: { comments: [comm] } },
//         function(err, result) {
//           if (err) {
//             console.error(err);
//           } else {
//             cb();
//           }
//         }
//       );
// }

// const upvote = (postId,cb)=>{
//     Post.findOneAndUpdate( {_id: postId},
//         {$inc : {'upvotes' : 1}},
//         {new: true},
//         function(err, response) {
//             if(err){
//             console.error(err);
//             }
//             cb();

//         });
// }

// const downvote = (postId,cb)=>{
//     Post.findOneAndUpdate( {_id: postId},
//         {$inc : {'downvotes' : 1}},
//         {new: true},
//         function(err, response) {
//             if(err){
//             console.error(err);
//             }
//             cb();

//         });
// }

exports.login = login;
exports.saveUser = saveUser;
exports.findUser = userOne;

exports.reset = resetPassword;
exports.rsr = resetPasswordRenderer;
exports.newPassword = newPassword;
exports.userUpvote = upvote;
