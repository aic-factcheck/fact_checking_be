// const httpStatus = require('http-status');
const Claim = require('../models/claim.model');

/**
 * Get Serach claims
 * @public
 */
exports.searchClaims = async (req, res, next) => {
  try {
    const { text } = req.query;
    const claims = await Claim.find({
      $text: {
        $search: text,
      },
    });

    res.json(claims);
  } catch (error) {
    next(error);
  }
};
