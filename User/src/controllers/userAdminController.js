const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.render('admin/users', { title: 'User Management', users });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};
