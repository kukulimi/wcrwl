const unibet = require('./routes/unibet');
const tab = require('./routes/tab');
const xbet = require('./routes/1xbet');

module.exports = function(app) {
    unibet(app);
    tab(app);
    xbet(app);
    // Other route groups could go here, in the future
};