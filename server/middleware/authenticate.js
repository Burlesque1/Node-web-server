// var {User} = require('./../models/user');

var authenticate =  async (req, res, next) => {
    var token = req.header('x-auth');
    console.log(req.body, '11'); 
  
  // validate uname pwd

  // gentoken

  // var user = await User.findByToken(token);
  //   req.user = user;
    req.token = token;
    req.user = '123';
    try{
      next();
    } catch(e) {
      res.status(401).send();
    }
  
};

module.exports = {authenticate};
