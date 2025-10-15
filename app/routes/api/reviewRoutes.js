const express = require('express');
const router = express.Router();
const ReviewController = require('../../controllers/reviewController');

module.exports = (pool) => {
    const reviewController = new ReviewController(pool);

    router.get('/reviews/:productId', (req, res) => reviewController.getReviews(req, res));
    router.post('/reviews', (req, res) => reviewController.createReview(req, res));
    router.put('/reviews/:id', (req, res) => reviewController.updateReview(req, res));
    router.delete('/reviews/:id', (req, res) => reviewController.deleteReview(req, res));

    return router;
};