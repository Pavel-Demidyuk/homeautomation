var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var configPaths = require('../../configs/drives/paths.json');
var util = require('util');
var mode = "dev";

var FsController = function () {
    var self = this;
    this.init = function () {
        this.removeAllListeners();
    };

    this.readDrives = function (watchDrives) {
        var result = [];
        fs.readdir(__dirname + configPaths.drivesPath, function (err, drives) {
            if (err) throw err;
            drives.forEach(function (driveId) {
                self.fetchDriveStates(driveId, function (drive) {
                    if (err) throw err;
                    result.push({"name": driveId, content: drive});

                    if (watchDrives) {
                        self.watchDrive(driveId);
                    }

                    // drives read finished
                    if (result.length === drives.length) {
                        self.emit("drivesReadFinish", result);
                        return;
                    }
                })
            })
        })
    }

    this.fetchDriveStates = function (driveId, callBack) {
        var result = {};
        var drivePaths = this.getAllDrivePaths(driveId);
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

    this.getChannelPath = function(driveId, channelName) {
        return __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths[channelName];
    },

    this.getAllDrivePaths = function (driveId) {
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

    /**
     * Channel A - Switches relay
     * Sensed A - Status of relay (ignored here)
     * Channel B - Do nothing
     * Sensed B (sensor) - Checks if there are voltage on the drive
     *
     * @param driveId
     */
    this.watchDrive = function (driveId) {

        var sensedAPath = this.getChannelPath(driveId, 'sensedA');
        var sensedBPath = this.getChannelPath(driveId, 'sensedB');

        fs.watch(sensedAPath, {persistent: true}, function () {
            fs.readFile(sensedAPath, {encoding: 'utf8'}, function (err, content) {
                self.emit("drivePulse", driveId, "A", content);
            });
        });

        fs.watch(sensedBPath, {persistent: true}, function () {
            fs.readFile(sensedBPath, {encoding: 'utf8'}, function (err, content) {
                self.emit("drivePulse", driveId, "B", content);
            });
        })
    }

    this.setDriveState = function (driveId, state) {

    }

    this.switchDrive = function (driveName, channel) {
        var state = this.getCurrentStates(driveName)[channel] == 1 ? 0 : 1;

        var fileName = "pio" + channel.toUpperCase();
        fs.writeFile(this.getChannelPath(driveName, fileName), state, function (err) {
            if (err) throw err;
        });

        if (this.mode == "dev") {
            var fileName = "sensed" + channel.toUpperCase();
            fs.writeFile(this.getChannelPath(driveName, fileName), state, function (err) {
                if (err) throw err;
            });
        }
    }

    this.getCurrentStates = function (driveName) {
        var paths = this.getAllDrivePaths(driveName);
        return {
            A: fs.readFileSync(this.getChannelPath(driveName, "sensedA")) == 1 ? 1 : 0,
            B: fs.readFileSync(this.getChannelPath(driveName, "sensedB")) == 1 ? 1 : 0
        }
    }
}

util.inherits(FsController, EventEmitter);
module.exports = FsController;