var mime = require('mime');

var util = require('../util');
var fileProxy = require('./file-proxy');
var remoteProxy = require('./remote-proxy');
var response = require('./response-modify');

exports.respond = function (req, res) {

};

exports.remoteProxy = remoteProxy;
exports.fileProxy = fileProxy;
exports.response = response;
