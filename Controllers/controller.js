const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Task = require('../models/task');
const Uploads = require('../models/upload');

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  if (err.message === "Incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "That email is already registered";
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "net ninja secret", {
    expiresIn: maxAge,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000)
};
const final = generateOTP();

module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.signup_post = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    return res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.login_post = async (req, res) => {
  console.log("body", req.body);
  const { useremail, password } = req.body;

  try {
    const user = await User.login(useremail, password); // Ensure 'User' model is correctly imported and used

    const token = createToken(user._id); // Create a token for the user
    console.log("token", token);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

    req.session.loggedIn = token;
    return res.status(200).redirect("/todolist");

  } catch (err) {
    const errors = handleErrors(err);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      // Send JSON response for AJAX requests
      return res.status(400).json({ errors });
    } else {
      return res.status(400).render("login", { errors });
    }
  }
};
module.exports.logout_post = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Logout successful" });
  });
};
module.exports.todo_get = async (req, res) => {
  res.render("todolist.ejs");
};

//forgot password
module.exports.forgot_get = async(req,res) => {
    res.render('forgot');
};
module.exports.forgot_post = async(req,res) => {
  const { email } = req.body; 
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not Registered");
      console.log("User not Registered");
      return res.redirect("/signup");
    }
    const OTP = final;


    const transfer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'patelsuhani040@gmail.com',
        pass: 'cziz pzey siiu tpvk'
      }
    });
    const mailOptions = {
      from: 'patelsuhani040@gmail.com',
      to: email,
      subject: 'Verification OTP',
      text: `${OTP} is you one time password for reset your password, Please keep your login details confidential, dont share this OTP to any one`
    };
    await transfer.sendMail(mailOptions)
    .then(() => {
      console.log('OTP Sent');
      console.log(OTP);
      res.render('otp');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('failed to send OTP');
    });
  }
  catch (err) {
    console.error("Error Sending OTP", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
};

//OTP Receive
module.exports.otp_get = async (req, res) => {
  res.render("otp");
};
module.exports.otp_post = async (req, res) => {
  const { email, otp, password } = req.body;
  const newOTP = final;

  try {
    if(newOTP != otp){
      req.flash('error','OTP Invalid');
      res.redirect('/otp');
    }

    const salt = await bcrypt.genSalt();
    const newhashed = await bcrypt.hash(password, salt);
    const updated = await User.findOneAndUpdate({password: newhashed});

    console.log(newhashed);

    req.flash('success','Password Changed');
    return res.redirect('/login');
  } 
  catch (err) {
    console.log("Error resetting password:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
};

//reset password
module.exports.reset_get = async (req, res) => {
  res.render("reset");
};
module.exports.reset_post = async (req, res) => {
  const { email, oldpassword, newpassword } = req.body; 

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not Registered");
      console.log("User not Registered");
      return res.redirect("/signup");
    }

    // Compare with user's actual password
    const match = await bcrypt.compare(oldpassword, user.password); 
    if (!match) {
      req.flash("error", "Old Password is Incorrect");
      return res.redirect("/reset");
    }

    const salt = await bcrypt.genSalt();
    const newhashed = await bcrypt.hash(newpassword, salt);

    // Directly update the password field
    user.password = newhashed; 
    console.log(user.password);
    await user.save();

    req.flash("success", "Password reset successfully");
    return res.redirect("/login");
  } 
  catch (err) {
    console.log("Error resetting password:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/reset");
  }
};

//ToDoList
module.exports.task_post = async (req, res) => {
    const { todo } = req.body;
    try {
        const task = new Task({ task: todo });
        await task.save();
        console.log('data inserted');
        res.redirect('/dashboard'); // Ensure only one response is sent
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
module.exports.task_get = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.render('dashboard', { tasks }); // Ensure only one response is sent
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
//  module.exports.task_put = async(req,res) => {
//     let { id } = req.params;
//     console.log(id);
//     res.send("well");
//  };
 module.exports.task_delete = async(req,res) => {
     try {
        let { id } = req.params;
        console.log(id);
        await Task.findByIdAndDelete(id);
        res.redirect('/dashboard'); 
        console.log('task deleted');
     } catch (err) {
         res.status(400).send(err);
     }
 };

 //File Upload
 module.exports.file_get = (req, res) => {
  res.render("file");
};
module.exports.file_post = async (req, res) => {
  try {
    const url = req.file.path;
    const fileName = req.file.filename;
    console.log(url);
    console.log(fileName);
    let final = new Uploads({link:url, filename:fileName});
    console.log('File uploaded in Database');
    await final.save()
    return res.redirect("/show");
  } 
  catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
};
module.exports.fileShow_get = async (req, res) => {
    const images = await Uploads.find({});
    res.render("show", { images });
};
module.exports.file_delete = async(req,res) => {
  try {
    let{ id } = req.params;
    await Uploads.findByIdAndDelete(id);
    return res.redirect("/show");
  }
  catch (err) {
      res.status(400).send(err);
  }
};