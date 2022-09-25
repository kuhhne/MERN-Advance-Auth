const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// Seteamos los modelos de la base de datos

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, "Please provide a username"]
    },
    email: {
        type: String,
        require: [true, "Please provida a email"],
        unique: true,
        match: [
            // Codigo de validacion para saber si lo ingresado es un email, seguido de un mensaje de error por si no lo es
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ]
    },
    password: {
        type: String,
        require: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next()
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// Comparacion de contraseñas para saber si la ingresada es valida

userSchema.methods.matchPasswords = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Metodo para asignar token de reinicio de contraseña

userSchema.methods.getSignedToken = function() {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRE
    })
}

// metodo para resetear la contraseña
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // Seteamos la expiracion del token de reinicio de contraseña, a 10 minutos
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
    return resetToken;
}

const User = mongoose.model('User', userSchema)

module.exports = User;