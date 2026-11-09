import passport from "passport";
import { UserModel } from "../models/UserModel.js";

export class AuthController {
  static login(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          error: "invalid_login",
          message: info?.message || "Email or password is incorrect."
        });
      }
      req.logIn(user, loginErr => {
        if (loginErr) return next(loginErr);
        res.json({
          message: "Signed in successfully.",
          user: UserModel.sanitize(user)
        });
      });
    })(req, res, next);
  }

  static logout(req, res, next) {
    req.logout(err => {
      if (err) return next(err);
      req.session.destroy(sessionErr => {
        if (sessionErr) return next(sessionErr);
        res.clearCookie("foodstallhub.sid");
        res.json({ message: "Signed out successfully." });
      });
    });
  }

  static async me(req, res) {
    if (!req.isAuthenticated?.() || !req.user?.isActive) {
      return res.json({ user: null });
    }
    const freshUser = await UserModel.findById(req.user.id);
    res.json({ user: UserModel.sanitize(freshUser || req.user) });
  }
}

export default AuthController;
