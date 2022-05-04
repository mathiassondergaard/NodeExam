const mongoose = require('mongoose');

const Role = mongoose.model(
    'Role',
    new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Role name cannot be empty!']
        },
    })
);

module.exports = Role;