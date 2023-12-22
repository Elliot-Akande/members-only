const asyncHandler = require("express-async-handler");
const Message = require("../models/message");

// Display home page on GET.
exports.homeGET = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .sort({ timestamp: -1 })
    .populate("author", "username")
    .exec();
  res.render("index", { title: "Member Messages", messages });
});
