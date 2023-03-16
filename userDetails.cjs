const mongoose = require("mongoose");

const UserDetailsScehma = new mongoose.Schema(
    {
        user: { type: String, unique: true },
        email: String,
        pwd: String,
        verified: Number
    },
    {
        collection: "UserInfo",
    }
);

mongoose.model("UserInfo", UserDetailsScehma);