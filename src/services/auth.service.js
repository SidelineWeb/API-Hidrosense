import User from "../models/User.js";
import jwt from "jsonwebtoken"

const loginService = (email) => User.findOne({ email: email }).select("+password");

const generateToken = (id, role) => jwt.sign({id: id, role: role}, process.env.SECRET_JWT, {expiresIn: 86400});

export { loginService, generateToken };
