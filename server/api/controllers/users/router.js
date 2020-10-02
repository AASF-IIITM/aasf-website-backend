import * as express from 'express';
import controller from './controller';
import isAuthenticated from '../../middlewares/isAuthenticated';
const multer = require('multer');

const fileFilter = (req, file, callback) => {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  if (!acceptedImageTypes.includes(file.mimetype))
    return callback(new Error('Please upload a valid Image file'), false);
  else return callback(null, true);
};
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + `/../../../../public/images/`);
  },
  filename: (req, file, callback) => {
    callback(null, req.user.roll+file.originalname);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single('dp');

export default express
  .Router()
  .post('/login', controller.login)
  .put('/password', isAuthenticated, controller.changePassword)
  .put('/dp', isAuthenticated, upload, controller.changeProfilePicture)
  .get('/dp', isAuthenticated, controller.getProfilePicture)
  .get('/details', isAuthenticated, controller.getUserDetails)
  .get('/leaderboard', isAuthenticated, controller.getLeaderboard);
