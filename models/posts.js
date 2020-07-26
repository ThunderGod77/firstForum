var userhandler = require("./users.js");

var mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://senna:Topa@123@cluster0.lje24.mongodb.net/proj1?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

const db = mongoose.connection;

const postSchema = new mongoose.Schema({
  title: String,
  story: String,
  user: String,
  comments: [String],
  tags: [String],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
});

const Post = mongoose.model("Post", postSchema);

const savePost = (ti, story, u, tags, cb) => {
  const newPost = new Post({ title: ti, story: story, user: u, tags: tags });
  newPost.save(function (err, np) {
    if (err) {
      console.error(err);
    }
    console.log(np.user + "post saved");
  });
  cb();
};

const showPost = (page, cb) => {
  Post.find()
    .countDocuments()
    .then((numPosts) => {
      Post.find({})
        .sort({ upvotes: -1 })
        .skip((page - 1) * 10)
        .limit(10)
        .exec((err, posts) => {
          if (err) {
            console.error(err);
          }
          cb(posts, page, numPosts);
        });
    });
};

const showPostOne = (postId, cb) => {
  Post.findById(postId, (err, post) => {
    if (err) {
      console.error(err);
    }
    cb(post);
  });
};

const addComment = (postId, comm, cb) => {
  Post.updateOne(
    { _id: postId },
    { $addToSet: { comments: [comm] } },
    function (err, result) {
      if (err) {
        console.error(err);
      } else {
        cb();
      }
    }
  );
};

const upvote = (postId, cb) => {
  Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { upvotes: 1 } },
    { new: true }
  )
    .then((result) => {
      userhandler.userUpvote(result.user, cb);
    })
    .catch((err) => {
      if (err) {
        return console.error(err);
      }
    });
};

const searchByTag = (tag, page, cb) => {
  Post.find()
    .countDocuments()
    .then((numPosts) => {
      Post.find({ tags: tag })
        .sort({ upvotes: -1 })
        .skip((page - 1) * 10)
        .limit(10)
        .exec((err, posts) => {
          if (err) {
            console.error(err);
          }
          cb(posts, page, numPosts);
        });
    });
};
const downvote = (postId, cb) => {
  Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { downvotes: 1 } },
    { new: true },
    function (err, response) {
      if (err) {
        console.error(err);
      }
      cb();
    }
  );
};

exports.save = savePost;
exports.dis = showPost;
exports.disOne = showPostOne;
exports.addComm = addComment;
exports.upvote = upvote;
exports.downvote = downvote;
exports.search = searchByTag;
