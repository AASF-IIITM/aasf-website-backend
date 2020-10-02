import UsersService from '../../../../services/users.service';
import l from '../../../../../common/logger';

export class Controller {
  async uploadUsers(req, res, next) {
    try {
      if (req.file) await UsersService.uploadUsers(req.file.filename);
      else throw { status: 400, message: 'Please upload a valid file' };
      res.status(200).json({ message: 'Users Uploaded Successfully' });
    } catch (err) {
      next(err);
    }
  }

  async editUserDetails(req, res, next) {
    try {
      const user = await UsersService.editUserDetails(req.params.roll, req.body);
      res.status(200).json({ user, message: 'User details updated successfully' });
    } catch (err) {
      next(err);
    }
  }
  async addAdmin(req, res, next) {
    try {
      const admin = await UsersService.addAdmin(req.body.roll, req.body.name);
      res.status(200).json({ admin, message: 'Admin added' });
    } catch (err) {
      next(err);
    }
  }
}
export default new Controller();
