module.exports = class Database {
  constructor() {
    this.database = [];
  }

  addUser(user) {
    this.database.push(user);
  }

  getUser(id) {
    return this.database[id - 1];
  }

  getAllUsers() {
    return this.database;
  }

  updateUser(id, user) {
    this.database[id - 1] = user;
  }

  deleteUser(id) {
    this.database.splice(id - 1, 1);
  }
}