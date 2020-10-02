const csv = require('csvtojson');
const bcrypt = require('bcrypt');
import * as jwt from 'jsonwebtoken';

import l from '../../common/logger';
import userModel from '../../models/user';
import eventModel from '../../models/event';
import { jwtSecret } from '../../common/config';

const saltRounds = 10;

class UsersService {
  /**
   * Upload a list of users from a csv to the database
   * @param {String} file - Name of the file uploaded
   */
  async uploadUsers(file) {
    try {
      const users = await csv().fromFile(__dirname + `/../../../public/users/${file}`);
      await userModel.insertMany(users);
    } catch (err) {
      l.error('[UPLOAD USERS]', err);
      throw err;
    }
  }
  async addAdmin(id, name) {
    try {
      await userModel.create({ _id: id, name: name, role: 'admin' });
    } catch (err) {
      l.error('[Add Admin]', err);
      throw err;
    }
  }

  /**
   * Login
   * @param {String} roll - Roll number of the student
   * @param {String} password
   */
  async login(roll, password) {
    try {
      const user = await userModel.findById(roll);
      if (!user) throw { status: 400, message: 'User not found' };

      const verifyPassword = await bcrypt.compare(password, user.password);
      if (!verifyPassword) throw { status: 401, message: 'Invalid Password' };

      return this.generateToken(user._id);
    } catch (err) {
      l.error('[LOGIN]', err, roll);
      throw err;
    }
  }

  /**
   * Change password of a user
   * @param {String} roll - Roll number of the student
   * @param {String} currentPassword - User's current password
   * @param {String} newPassword - User's new password
   */
  async changePassword(roll, currentPassword, newPassword) {
    try {
      const user = await userModel.findById(roll);
      if (!user) throw { status: 400, message: 'User not found' };

      const verifyPassword = await bcrypt.compare(currentPassword, user.password);
      if (!verifyPassword) throw { status: 401, message: 'Invalid Password' };

      const hash = await bcrypt.hash(newPassword, saltRounds);
      await userModel.findByIdAndUpdate(roll, {
        password: hash,
      });
    } catch (err) {
      l.error('[CHANGE PASSWORD]', err, roll);
      throw err;
    }
  }

  /**
   * Change Profile Picture of a user
   * @param {String} roll - Roll number of the student
   * @param {String} dp - Profile Picture of the student
   */
  async changeProfilePicture(roll, dp) {
    try {
      const user = await userModel.findByIdAndUpdate(
        roll,
        {
          dp,
        },
        { new: true, select: { password: 0 } }
      );
      if (!user) throw { status: 400, message: 'User does not exist' };
      return user;
    } catch (err) {
      l.error('[CHANGE PROFILE PICTURE]', err, roll);
      throw err;
    }
  }

  /**
   * Get the details of a user
   * @param {String} roll - Roll number of the student
   */
  async getUserDetails(roll) {
    try {
      const user = await userModel.findById(roll, '-password');
      if (!user) throw { status: 400, message: 'User not found' };

      return user;
    } catch (err) {
      l.error('[GET USER DETAILS]', err, roll);
      throw err;
    }
  }

  /**
   * Edit the details of a user
   * @param {String} roll - Roll number of the student
   * @param {Object} data - Updated data of the student. Obeys the user model
   */
  async editUserDetails(roll, data) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, saltRounds);
      }
      const user = await userModel.findByIdAndUpdate(roll, data, {
        new: true,
        select: { password: 0 },
      });
      if (!user) throw { status: 400, message: 'User not found' };
      return user;
    } catch (err) {
      l.error('[EDIT USER DETAILS]', err, roll);
      throw err;
    }
  }

  /**
   * Fetch the current leaderboard and highest possible points till date
   */
  async getLeaderboard() {
    try {
      //Aggregation stages:-
      //1. Match only users, leave out admins.
      //2. Add a totalScore field by adding the 3 category scores.
      //3. Project only the roll number, name and totalScore of students.
      //4. Sort the list in descending order of total score.
      const leaderboardPromise = userModel.aggregate([
        {
          $match: { role: 'user' },
        },
        {
          $addFields: {
            totalScore: {
              $add: ['$score.technical', '$score.managerial', '$score.oratory'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            totalScore: 1,
          },
        },
        {
          $sort: {
            totalScore: -1,
          },
        },
      ]);

      //To display the percentage score that a student has achieved,
      //the highest possible score till date is needed.

      //Find all past events in which either attendance was marked or it was a contest
      //and winners were declared.
      const eventsPromise = eventModel.find({
        $or: [{ qr: true }, { winners: true }],
      });

      const [leaderboard, events] = await Promise.all([leaderboardPromise, eventsPromise]);

      //Calculate the highest possible score.
      const totalScore = {
        technical: 0,
        managerial: 0,
        oratory: 0,
      };
      events.forEach(event => {
        if (event.qr) totalScore[event.category] += (event.importance * 5 + 5) * event.numberOfDays;
        if (event.winners) totalScore[event.category] += event.importance * 5 + 10;
      });

      return { leaderboard, totalScore };
    } catch (err) {
      l.error('[GET LEADERBOARD]', err);
      throw err;
    }
  }

  /**
   * Generate the JWT Token for the user
   * @param {String} roll - Roll number of the student
   */
  generateToken(roll) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 1000000); //Infinite Expiry!

    return jwt.sign(
      {
        roll,
        exp: exp.getTime() / 1000,
      },
      jwtSecret
    );
  }
}

export default new UsersService();
