const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    uniquie: true,
    required: [true, "Please enter username"],
    lowercase: true,
  },
  email: {
    type: String,
    uniquie: true,
    required: [true, "Please enter Email"],
    lowercase: true,
    validate: [isEmail, "Please enter valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please enter Password"],
    minlength: [6, "Minimum Password length is 6 character"],
  },
});

//fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
userSchema.statics.login = async function (useremail, password) {
  const user = await this.findOne({ email: useremail });
  if (user) {
    console.log("user");
    console.log(user.password);
    console.log(password);
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      console.log("auth", user);
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};
const user = mongoose.model("user", userSchema);

module.exports = user;
