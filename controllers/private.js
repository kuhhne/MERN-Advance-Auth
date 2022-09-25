exports.getPrivateData = (req, res, next) => {
    res.status(200).json({
        success: true,
        data: 'You got acces to private data in this route'
    })
}