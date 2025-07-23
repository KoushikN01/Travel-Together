const jwt = require('jsonwebtoken');

exports.generateTokens = (user) => {
  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}; 