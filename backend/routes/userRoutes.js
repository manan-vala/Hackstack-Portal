const express = require('express');
const usersCtrl = require('../controllers/userController');

const router = express.Router();

// GET /users -> List all users.
router.get('/', usersCtrl.listUsers);

// GET /users/:id -> Get one user by id.
router.get('/:id', usersCtrl.getUser);

// POST /users -> Create a new user.
router.post('/', usersCtrl.createUser);

// PATCH /users/:id -> Update an existing user.
router.patch('/:id', usersCtrl.updateUser);

// DELETE /users/:id -> Remove a user.
router.delete('/:id', usersCtrl.deleteUser);

module.exports = router;
