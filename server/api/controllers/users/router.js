import * as express from "express";
const multer = require("multer");
import controller from "./controller";
import isAuthenticated from "../../middlewares/isAuthenticated";

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + `/../../../../public/profilePictures/`);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    return callback(null, true);
  } else {
    return callback(new Error("Only .jpeg, .jpg, .png files are allowed"), false);
  }

}

var upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

//Upload a .jpeg, .jpg, .png file with field name as "dp" as form-data body


export default express
  .Router()
  .post("/login", controller.login)
  .put("/password", isAuthenticated, controller.changePassword)
  .put("/dp", isAuthenticated, upload.single("dp"), controller.changeProfilePicture)
  .get("/details", isAuthenticated, controller.getUserDetails)
  .get("/leaderboard", isAuthenticated, controller.getLeaderboard);
