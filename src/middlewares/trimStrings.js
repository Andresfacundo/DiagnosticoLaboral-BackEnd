function trimStringname(req,res,next) {
    const trimObject = (obj) => {
        if (!obj) return;
        Object.keys(obj).forEach(key => {
            if(typeof obj[key] === "string"){
                obj[key] = obj[key].trim();
            }
        });    
    }
    trimObject(req.body);
    trimObject(req.query);
    trimObject(req.params);

    next();
}
module.exports = trimStringname;