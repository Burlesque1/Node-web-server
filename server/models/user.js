const mongoose = require('mongoose');
const validator = require('validator'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const moment = require('moment');

var UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate:{
            validator: validator.isEmail,
            message: '{VALIE} IS NOT A VALID EMAIL',
            isAsync: true
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength:1,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    tokens:[{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    createdAt: {
        type: String,
        default: null
    }
})

// cannot use arrow function here
// because arrow function dose not bind to "this"
UserSchema.methods.toJSON = function () { // called by res.send()
    var user = this;
    var userObject = user.toObject();
  
    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{access, token}]);
    user.createdAt = moment().format();
    return user.save().then(() => {
        return token;
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    
    return User.findOne({email}).then((user) => {
        if(!user){
            return Promise.reject('no record found');
        }
        return new Promise((resolve, reject) => {
            // if(password === user.password){
            //     resolve(user);
            // } else {
            //     reject('password incorrect');
            // }
            bcrypt.compare(password, user.password, (err, res) =>{       // ??????????????????????????????
                if(res){
                    resolve(user);
                } else {
                    reject('password incorrect');
                }
            });
        });
    });
};

// a mongoose middleware not express middleware that hash password into crypted format
UserSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = {User}
