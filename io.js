module.exports.setup = function(_io, callback) {
    module.exports.socketio = _io;
    callback();
}