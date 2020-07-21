const bcryptjs = require('bcryptjs');


var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://senna:Topa@123@cluster0.lje24.mongodb.net/proj1?retryWrites=true&w=majority',{ useNewUrlParser: true } );

const db = mongoose.connection;

const userScema = new mongoose.Schema({
    email:{type:String,unique: true},
    password:String,
});

const User = mongoose.model('User', userScema);

const saveUser = (email,password,cb)=>{
    const newUser = new User({email:email,password:password});
    newUser.save(function(err,nu){
        if(err){
            console.error(err);
        }
        console.log(nu.email+" registered");
    });
    cb();
}


const login = (req,res,next)=>{
    const email = req.body.username;
    const password = req.body.passw;

    User.findOne({email:email},(err,user)=>{
        if(err){
            console.error(err);
        }
        if(!user || user.password!==password){
            res.redirect('/login');
        }
        req.session.isLoggedin= true;
        req.session.user = user;
        res.redirect('/addPost')
    })
}



// const showPost = (cb)=>{
//     Post.find({}).sort({upvotes:-1}).exec((err,posts)=>{
//         if(err){
//             console.error(err);
//         }
//         cb(posts);
//     })
// }

const userOne = (email,cb)=>{
    User.findOne({email:email},(err,user)=>{
        if(err){
            console.error(err);
        }
        cb(user);
    })
}

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