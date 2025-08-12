



exports.is_Admin = (req, res, next) => {

    const is_Admin = req.isAdmin
    if (!is_Admin) {
        return res.status(403).json({ message: "You Dont Have Admin Permission " })
    }

    next()

}