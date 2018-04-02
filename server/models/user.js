const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
    }]
})

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{access, token}]);
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
            if(password === user.password){
                resolve(user);
            } else {
                reject('password incorrect');
            }
            // bcrypt.compare(password, user.password, (err, res) =>{       // ??????????????????????????????
            //     if(res){
            //         console.log('yes');
            //         resolve(user);
            //     } else {
            //         console.log('no');
            //         reject();
            //     }
            // });
        });
    });
};


var User = mongoose.model('User', UserSchema);
module.exports = {User}