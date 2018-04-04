class userClass {
    constructor() {
        this.users = [];
    }
    addUser(id, name, room){
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }
    removeUser(id) {
        var user = this.getUser(id);

        if(user) {
            this.users = this.users.filter((user) => user.id !== id);
        }

        return user;
    }
    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }
    getUserID(name) {
      var user = this.users.filter((user) => user.name === name);
      if(user.length !== 0){
        return user[0]["id"];
      }
    }
    getUserList(room) {
        var users = this.users.filter((user) => user.room === room);
        var namesArray = users.map((user) => user.name);

        return namesArray;
    }
}

module.exports = {userClass};