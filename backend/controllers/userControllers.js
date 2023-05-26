const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//get user data
const getData = async (req, res, next) => {
  try {
    const users = await User.find();
    if (users.length > 0) {
      res.send(users);
    } else {
      res.send({ result: "no users found" });
    }
  } catch (error) {
    next(error);
  }
};

//GET CURRENT USER DATA

const getCurrentUserData = async (req, res, next) => {
  let result = await User.findById({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "no record" });
  }
};

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, pic } = req.body;

//   if (!name || !email || !password) {
//     res.status(400).json({ error: "Please enter all the fields" });
//   }

//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400).json({ error: "User already exists" });
//   }

//   const user = await User.create({
//     name,
//     email,
//     password,
//     pic,
//   });

//   if (user) {
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       pic: user.pic,
//       token: generateToken(user._id),
//     });
//   } else {
//     res.status(400).json({ error: "User not found" });
//   }
// });

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Bad request" });
    return;
  }

  const user = await User.findOne({ email });

  if (user) {
    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } else {
    res.status(401).json({ error: "Invalid email" });
  }
});



module.exports = {
  allUsers,
  // registerUser,
  authUser,
  getData,
  getCurrentUserData,
};
