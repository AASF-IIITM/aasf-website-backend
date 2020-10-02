import UsersService from '../services/users.service';

// eslint-disable-next-line no-unused-vars, no-shadow
export default async function isAdmin(req, res, next) {
  if (!req.user) res.status(401).send({ message: 'You are not authorized to perform this action' });
  else {
    try {
      const userDetails = await UsersService.getUserDetails(req.user.roll);
      if (userDetails.role === 'admin') next();
      else res.status(401).send({ message: 'You are not authorized to perform this action' });
    } catch (err) {
      res.status(err.status || 500).send({ message: err.message || 'Some error has occurred' });
    }
  }
}
