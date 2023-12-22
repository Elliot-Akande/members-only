const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const he = require("he");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 50 },
  message: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, required: true },
});

MessageSchema.virtual("formattedTimestamp").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.DATETIME_SHORT
  );
});

MessageSchema.virtual("decodedTitle").get(function () {
  return he.decode(this.title);
});

MessageSchema.virtual("decodedMessage").get(function () {
  return he.decode(this.message);
});

module.exports = mongoose.model("Message", MessageSchema);
