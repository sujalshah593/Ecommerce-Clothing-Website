import jwt from 'jsonwebtoken';

export const AUTH_SESSION_SECONDS = 24 * 60 * 60;

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: AUTH_SESSION_SECONDS,
    });
};

export default generateToken;
