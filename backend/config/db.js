const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://prashantsisodia08:prashant@cluster0.tz8imch.mongodb.net/ps",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
console.log("DB connected");
