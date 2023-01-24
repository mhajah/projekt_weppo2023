/**
*
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/

function authorize(req, res, next) {
    if ( req.signedCookies.user ) {
        console.log(req.signedCookies.user) //nazwa uzytkownika
        if(req.url=="/admin")
            perm=checkpermission(req.signedCookies.user)
            if(perm==1)
                console.log("Nie dla pospolstwa administrowanie sklepem")
        next();
        } else {
            console.log("REQ.URL: "+ (req.url))
            res.redirect('/login?returnUrl='+req.url);
        }
        }
           

module.exports=authorize