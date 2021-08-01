const cloudinary = require("cloudinary");
const requireLogin = require("../middlewares/requireLogin");
const keys = require("../config/keys");

module.exports = (app) => {
  app.get("/api/image-upload", requireLogin, async (req, res) => {
    const timestamp = new Date().getTime();
    const signature = await cloudinary.utils.api_sign_request(
      { timestamp },
      keys.cloudinarySecret
    );

    res.send({ timestamp, signature });
  });
};
