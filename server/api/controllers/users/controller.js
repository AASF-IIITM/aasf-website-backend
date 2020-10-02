import UsersService from "../../services/users.service";
import xss from "xss";

import { xssOptions } from "../../../common/config";
import validImage from "../../../utils/validImage";

export class Controller {
  async login(req, res, next) {
    try {
      const { roll, password } = req.body;
      const token = await UsersService.login(roll, password);
      res.status(200).json({ token, message: "Successfully Logged in!" });
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const { roll } = req.user;
      const user = await UsersService.getUserDetails(roll);
      res.status(200).json({ user, message: "Details successfully fetched" });
    } catch (err) {
      next(err);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const { leaderboard, totalScore } = await UsersService.getLeaderboard();
      res.status(200).json({
        leaderboard,
        totalScore,
        message: "Leaderboard successfully fetched",
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { roll } = req.user;
      let { currentPassword, newPassword } = req.body;

      currentPassword = xss(currentPassword, xssOptions);
      newPassword = xss(newPassword, xssOptions);
      if (!currentPassword || !newPassword)
        throw { status: 400, message: "Invalid Password" };

      await UsersService.changePassword(roll, currentPassword, newPassword);
      res.status(200).json({ message: "Password successfully changed!" });
    } catch (err) {
      next(err);
    }
  }

  async changeProfilePicture(req, res, next) {
    try {
      const { roll } = req.user;

      // console.log(req.body)
      const updatedUser = await UsersService.changeProfilePicture(
        roll,
        req.user.roll+req.file.originalname
      );
      res.status(200).json({
        user: updatedUser,
        message: "Profile Picture Successfully Changed",
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfilePicture(req,res,next){
    try {
      const { roll } = req.user;
      const user = await UsersService.getUserDetails(roll);
      if (!user.dp) {
        res.status(400).json({
          message: "No dp found"
        })
      }else{
      }
    } catch (err) {
      next(err);
    }
  }
}
export default new Controller();
