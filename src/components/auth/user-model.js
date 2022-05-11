const mongoose = require('mongoose');

const User = mongoose.model(
    'User',
    new mongoose.Schema({
        username: {
            type: String,
            required: [true, 'Username cannot be empty!']
        },
        email: {
            type: String,
            required: [true, 'Email cannot be empty!']
        },
        employeeId: {
            type: String,
            required: [true, 'Employee id cannot be empty!']
        },
        password: {
            type: String,
            required: [true, 'Password cannot be empty!'],
            minLength: [12, 'Password must be 12 characters or longer!'],
        },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role',
            }
        ]
    })
);

module.exports = User;
