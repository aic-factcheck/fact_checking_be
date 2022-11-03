const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const articleRoutes = require('./article.route');
const searchRoutes = require('./search.route');
const ratingRoutes = require('./rating.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

// includes nested claims and review routes
router.use('/articles', articleRoutes);
router.use('/search', searchRoutes);
router.use('/vote', ratingRoutes);

module.exports = router;
