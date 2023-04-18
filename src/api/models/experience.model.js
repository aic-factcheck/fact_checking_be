const mongoose = require('mongoose');

/**
 * Experience Schema
 * @private
 */
const experienceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  exp: {
    type: Number,
    required: true,
  },
  action: {
    type: String,
    maxlength: 128,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
experienceSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'userId', 'exp', 'action', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
experienceSchema.statics = {

  /**
   * Get the most recent Experience for user
   *
   * @param {ObjectId} id - The objectId of User.
   * @returns {Promise<Experience, APIError>}
   */
  async get(userId) {
    let exp;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      exp = await this.findOne({ userId }).sort({ createdAt: 'desc' }).exec();
    }
    if (exp) {
      return exp;
    }

    return { exp: 0 };
    // throw new APIError({
    //   message: 'Experience does not exist',
    //   status: httpStatus.NOT_FOUND,
    // });
  },
};

/**
 * @typedef Experience
 */
module.exports = mongoose.model('Experience', experienceSchema);
