const Task = require('../models/task');
const express = require('express');
const { Router } = require('express');
const authcontroller = require('../Controllers/controller.js');

const router = Router();

router.get('/signup',authcontroller.signup_get);
router.post('/signup',authcontroller.signup_post);
router.get('/login',authcontroller.login_get);
router.post('/loginpost',authcontroller.login_post);
router.post('/logout',authcontroller.logout_post);
router.get('/todolist',authcontroller.todo_get);

//forgot password
router.get('/forgot',authcontroller.forgot_get);
router.post('/forgotpassword',authcontroller.forgot_post);
router.get('/otp',authcontroller.otp_get);
router.post('/otp',authcontroller.otp_post);

//reset password
router.get('/reset',authcontroller.reset_get);
router.post('/reset',authcontroller.reset_post);

//Todolist
router.post('/tasks', authcontroller.task_post);
router.get('/dashboard', authcontroller.task_get);
// router.put('/tasks/:id', authcontroller.task_put);
router.delete('/:id/delete', authcontroller.task_delete);

module.exports = router;


