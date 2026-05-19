const express = require('express');
const mongoose = require('mongoose');
const progressCtrl = require('../controllers/progressController');

const router = express.Router();

// GET /progress -> List all progress records.
router.get('/', progressCtrl.listProgress);

// GET /progress/:id -> Get one progress record by id.
router.get('/:id', progressCtrl.getProgress);

// PATCH /progress/:id -> Update a progress record.
router.patch('/:id', progressCtrl.updateProgress);

module.exports = router;
