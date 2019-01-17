const proxy = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(proxy(['/auth','/api'], 
        { target: 'http://localhost:5000/' }
    ));
}