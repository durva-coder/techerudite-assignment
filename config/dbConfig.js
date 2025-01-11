module.exports = {
  port: "3306",
  host: "localhost",
  user: "root",
  password: "root",
  db: "durvab",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
