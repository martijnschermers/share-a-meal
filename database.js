module.exports = class Database {
  constructor() {
    this.database = [];
    this.id = 0; 
  }

  loginUser(user) {
    let userIndex = this.database.findIndex((currentUser) => currentUser.emailAdress === user.emailAdress);
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
      return true; // return if the user was added
    } 

    return false; 
  }

  getUser(id) {
    let databaseUser = this.database.filter((currentUser) => currentUser.id == id);
    if (databaseUser.length === 1) {
      return databaseUser;
    }
    return null;  // return null if no user was found
  }

  getAllUsers() {
    return this.database;
  }

  updateUser(id, user) {
    let userIndex = this.database.findIndex((currentUser) => currentUser.id == id);
    if (this.database[userIndex] && this.database[userIndex] != user) {
      this.database[userIndex] = user;
      return true; 
    }
    return false;
  }

  deleteUser(id) {
    let userIndex = this.database.findIndex((currentUser) => currentUser.id == id);
    if (userIndex !== -1) {
      this.database.splice(userIndex, 1);
      return true;
    }
    return false;
  }
}