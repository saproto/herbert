var loadModules = require('./modules.json');

var modules = {};

module.exports.loaded = modules;

for(i in loadModules) {
    if(loadModules[i].active) {
        console.log("[moduleloader] Loading " + loadModules[i].name);
        modules[loadModules[i].name] = require('./herbert_modules/' + loadModules[i].name + '/' + loadModules[i].name);
    }
}