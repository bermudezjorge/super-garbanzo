jest.setTimeout(60000);
Number.prototype._called = {};

const mongoose = require("mongoose");
const keys = require("../config/keys");

require("../models/User");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });
