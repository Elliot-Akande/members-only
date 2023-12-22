const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Message = require("../models/message");

// Display home page on GET.
exports.homeGET = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .sort({ timestamp: 1 })
    .populate("author", "username")
    .exec();
  res.render("index", { title: "Member Messages", messages });
});

// Display form for becoming a member on GET.
exports.joinTheClubGET = asyncHandler(async (req, res, next) => {
  if (!req.user) res.redirect("/");

  res.render("joinTheClub", { title: "Join the club" });
});

// Handle user becoming a member on POST.
exports.joinTheClubPOST = asyncHandler(async (req, res, next) => {
  const passcode = process.env.MEMBER_PASSCODE;

  if (req.body.passcode === passcode) {
    const user = req.user;
    user.isMember = true;
    await user.save();
    res.render("joinTheClub", { title: "Member Confirmation" });

    return;
  }

  res.render("joinTheClub", {
    title: "Join the club",
    error: "Incorrect passcode!",
  });
});

// Display form for creating a Message on GET.
exports.createMessageGET = asyncHandler(async (req, res, next) => {
  if (!req.user) res.redirect("/");
  res.render("createMessage", { title: "Create Message" });
});

// Handle Message create on POST.
exports.createMessagePOST = [
  body("title", "Title must be present").trim().isLength({ min: 10 }).escape(),
  body("message", "Message must be present")
    .trim()
    .isLength({ min: 10 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      message: req.body.message,
      author: req.user._id,
      timestamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.render("createMessage", {
        title: "Create Message",
        errors: errors.array(),
        message,
      });
      return;
    }

    await message.save();
    res.redirect("/");
  }),
];

// Display Message delete page on GET.
exports.deleteMessageGET = asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) res.redirect("/");

  const message = await Message.findById(req.params.id).exec();
  if (message === null) res.redirect("/");

  res.render("deleteMessage", { title: "Delete Message", message });
});

// Handle Message delete on POST.
exports.deleteMessagePOST = asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) res.redirect("/");

  await Message.findByIdAndDelete(req.params.id);
  res.redirect("/");
});
