const unibet = require('./routes/unibet');
const tab = require('./routes/tab');

module.exports = function(app) {
    unibet(app);
    tab(app);
    // Other route groups could go here, in the future
};