const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const articleRoutes = require('./article.route');
const searchRoutes = require('./search.route');
const voteRoutes = require('./vote.route');
const saveRoutes = require('./save.route');
const hotRoutes = require('./hot.route');
const statsRoutes = require('./stats.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

// include nested claims and review routes
router.use('/articles', articleRoutes);
router.use('/search', searchRoutes);
router.use('/vote', voteRoutes);
router.use('/hot', hotRoutes);
router.use('/save', saveRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
