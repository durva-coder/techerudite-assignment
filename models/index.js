// models/index.js
const dbConfig = require("../config/dbConfig.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
  port: dbConfig.port,
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  logging: console.log,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const db = {};

db.sequelize = sequelize;
db.Users = require("./userModel.js")(sequelize, DataTypes);
db.EmailVerification = require("./emailVerificationModel.js")(
  sequelize,
  DataTypes
);

db.sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
});

module.exports = db;
