var {User} = require('./../models/user');

var authenticate =  async (req, res, next) => {
    var token = req.header('x-auth');
    next();
    // User.findByToken(token).then((user) => {
    //   if (!user) {
    //     return Promise.reject('no user found!');
    //   }
      
    //   req.user = user;
    //   req.token = token;
    //   next();
    // }).catch((e) => {
    //   console.log('123', e);
    //   res.status(401).send();
    // });
};

module.exports = {authenticate};
