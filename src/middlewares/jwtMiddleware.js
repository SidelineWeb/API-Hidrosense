import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).send({ message: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ message: 'Token malformatted' });
    }

    jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token' });
        }

        // Anexa os dados do usuário ao objeto de requisição
        req.user = { id: decoded.id, role: decoded.role };
        next();
    });
};

export default authMiddleware;
