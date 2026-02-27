const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

exports.getUsers = catchAsync(async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.render('admin/users', {
            title: 'Manage Users',
            users,
            path: '/admin/users'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

exports.deleteUser = catchAsync(async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/users');
    }
});
