module.exports = class Database {
  constructor() {
    this.database = [];
    this.id = 0; 
  }

  loginUser(user) {
    let userIndex = this.database.findIndex(
      (currentUser) => currentUser.emailAdress === user.emailAdress
    );
    if (userIndex === -1) {
      return null;
    }
    let currentUser = this.database[userIndex];
    if (currentUser.password === user.password) {
      return currentUser;
    }
    return null;
  }

  addUser(user) {
    let databaseUser = this.database.filter((currentUser) => currentUser.emailAdress === user.emailAdress);

    if (databaseUser.length === 0) {
      this.id++;
      user = {
        id: this.id,
        ...user,
      }
      this.database.push(user);
      return true; // return the user that was added
    } 

    return false; 
  }

  getUser(id) {
    return this.database[id - 1];
  }

  getAllUsers() {
    return this.database;
  }

  updateUser(id, user) {
    let databaseUser = this.database[id - 1];
    if (databaseUser != null && databaseUser != user) {
      databaseUser = user;
      return true; 
    }
    return false;
  }

  deleteUser(id) {
    return this.database.splice(id - 1, 1);
  }
}