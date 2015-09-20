var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var configPaths = require('../../configs/drives/paths.json');
var util = require('util');

var FsController = function () {
    var self = this;
    this.init = function () {
        this.removeAllListeners();
    };

    this.readDrives = function () {
        var result = [];
        fs.readdir(__dirname + configPaths.drivesPath, function (err, drives) {
            if (err) throw err;
            drives.forEach(function (driveId) {
                self.getDrive(driveId, function (drive) {
                    if (err) throw err;
                    result.push({"name": driveId, content: drive});
                    // drives read finished
                    if (result.length === drives.length) {
                        self.emit("drivesReadFinish", result);
                        return;
                    }
                })
            })
        })
    }

    this.getDrive = function (driveId, callBack) {
        var result = {};
        var drivePaths = this.getDrivePaths(driveId);
        var i = 1 ;
        for (var name in drivePaths) {
            (function (name) {
                fs.readFile(drivePaths[name], {encoding: 'utf8'}, function (err, data) {
                    if (err) throw err;
                    result[name] = data == 1 ? 1 : 0;
                    if (i == 4) {
                        callBack(result);
                    }
                    i++;
                })
            })(name);
        }
    }

    this.getDrivePaths = function (driveId, fileName) {
        var result = {
            "pioA": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.pioA,
            "pioB": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.pioB,
            "sensedA": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.sensedA,
            "sensedB": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.sensedB
        }

        if (fileName) {
            return result[fileName];
        }

        return result;
    }


    /**
     * Detects drive type.
     *
     * @param driveId
     * @returns {string}
     */
    this.detectType = function (driveId) {
        // todo implement logic
        return 'switcher';
    }

    this.fetchStates = function (driveNames) {
        var result = [];
        for (var key in driveNames) {
            result.push({
                driveName: driveNames[key],
                states: this.getCurrentStates(driveNames[key])
            });
        }
        this.emit("statesFetched", result);
    }

    this.watchFile = function (driveId) {
        var fullFilePath = this.getFullFilePath(driveId);
        fs.watch(fullFilePath, {persistent: true}, function () {
            console.log("root switch");
            fs.readFile(fullFilePath, {encoding: 'utf8'}, function (err, content) {
                self.emit("drivePulse", driveId, content);
            });
        })
    }

    this.setDriveState = function (driveId, state) {

    }

    this.switchDrive = function (driveName, channel) {
        var state = this.getCurrentStates(driveName)[channel] == 1 ? 0 : 1;

        var fileName = "pio" + channel.toUpperCase();
        fs.writeFile(this.getDrivePaths(driveName, fileName), state, function (err) {
            if (err) throw err;
        });

        if (mode == "dev") {
            var fileName = "sensed" + channel.toUpperCase();
            fs.writeFile(this.getDrivePaths(driveName, fileName), state, function (err) {
                if (err) throw err;
            });
        }
    }

    this.getCurrentStates = function (driveName) {
        var paths = this.getDrivePaths(driveName);
        return {
            A: fs.readFileSync(this.getDrivePaths(driveName, "sensedA")) == 1 ? 1 : 0,
            B: fs.readFileSync(this.getDrivePaths(driveName, "sensedB")) == 1 ? 1 : 0
        }
    }
}

util.inherits(FsController, EventEmitter);
module.exports = FsController;