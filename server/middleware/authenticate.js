var {User} = require('./../models/user');

var authenticate =  async (req, res, next) => {
    var token = req.originalUrl.substring(6);
    console.log(token);
    // var token = req.header('x-auth');
    try {
      var user = await User.findByToken(token)
      if (!user) {
        return Promise.reject('not authenticated!');
      }
      
      req.user = user;
      req.token = token;
      next();
    } catch(e) {
      console.log(e);
      res.status(401).redirect('/');
    };
};

module.exports = {authenticate};
