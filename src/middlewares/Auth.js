const User = require('../models/User');

module.exports = {
    private: async (req, res, next) => {
        const token = req.query?.token || req.body?.token || req.headers?.authorization;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        next();
    }
};
