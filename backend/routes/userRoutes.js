const express = require("express");
const usersCtrl = require("../controllers/userController");

const router = express.Router();

router.get("/", usersCtrl.listUsers);
router.get("/:id", usersCtrl.getUser);
router.post("/", usersCtrl.createUser);
router.patch("/:id", usersCtrl.updateUser);
router.delete("/:id", usersCtrl.deleteUser);
module.exports = router;
