const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse')

// limitamos las rutas visibles para los usuarios no logeados
exports.protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //Jwt empieza con Bearer, ej:
        // Bearer {jwt}
        // queremos eliminar el espacio entre bearer y el token, y quedarnos con la segunda parte(el token)
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) {
        // llamamos a nuestro error handler
        return next(new ErrorResponse('Not authorized to acces this route'), 401);
    }

    try {
        // desciframos el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // buscamos si hay alguno usuario con ese token, buscamos el usuario por id
        const user = await User.findById(decoded.id);

        // si no hay usuario, llamamos a nuestro error handler
        if(!user) {
            return next(new ErrorResponse('No user found with this id'), 404)
        }

        req.user = user;
        // y si encontramos un user, seguimos
        next()
    } catch (error) {
        return next(new ErrorResponse('Not authorized to acces this route'))
    }
}