//wrapAsync function is better way to write try & catch
module.exports = (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch(next);
    }
}