import express from "express";
import { login, logout, register } from "../controllers/authController";
import { isAuth } from "../middlewares/isAuth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuth, logout);

export default router;
