
var jwt = require('jsonwebtoken');

exports.fetch_user = (req, res, next) => {
    const token = req.header('Token')

    if (!token) return res.status(401).json({ error: 'Access denied' });
    if (!token) {
        return res.status(401).json({ status: "Fail", Message: "No Token Found" })
    }

    try {
        const user = jwt.verify(token, 'tarun')
        // console.log("user id "+ user.id)
        // console.log("admin status "+user.isAdmin)
        if (!user) {
            return res.status(401).json({ status: "Fail", Message: "Not Valid Id  Found" })
        }
       const  decodeUser = jwt.decode(token)
       console.log(decodeUser)
        req.id = user.id
        req.isAdmin = user.isAdmin
        next()

    } catch (err) {
        console.log("Some error Occured middleware")
        return res.status(401).json({message:'Some error Occured'})
    }





}