module.exports = function (options) {
    require('./lib/config').extend(options);

    require('./lib');
};
