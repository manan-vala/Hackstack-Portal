const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const modulesCtrl = require('../controllers/modulesController');

const router = express.Router();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// GET /modules -> List all published modules.
router.get('/', modulesCtrl.listModules);

// GET /modules/:slug -> Get one module by slug.
router.get('/:slug', modulesCtrl.getModuleBySlug);

// POST /modules/:id/register -> Register the current user for a module.
router.post('/:id/register', auth, modulesCtrl.registerModule);

// POST /modules -> Create a new module.
router.post('/', auth, admin, modulesCtrl.createModule);

// PUT /modules/:id -> Update an existing module.
router.put('/:id', auth, admin, modulesCtrl.updateModule);

// DELETE /modules/:id -> Delete a module.
router.delete('/:id', auth, admin, modulesCtrl.deleteModule);

module.exports = router;
