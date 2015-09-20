var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DrivesController = function (dbModel) {

    var self = this;
    this.dbModel = dbModel;
    this.drives = [];
    this.fsDrives = [];
    this.newDrives = [];
    this.driveByNames = [];

    this.init = function () {
        this.removeAllListeners();
    };

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

    this.setFsDrives = function (fsDrives) {
        this.fsDrives = fsDrives;
    }

    this.fetchAllDrives = function () {

        this.dbModel.getAllDrives(function (data) {
            self.drives = data;
            self.mapDrivesByNames(data);
            self.emit("drivesFetched", data);
        });
    }

    this.mapDrivesByNames = function (drives) {
        var self = this;
        drives.forEach(function (drive) {
            self.driveByNames[drive.value.drive] = drive.value;
        })
    }

    this.newDrivesAvailable = function () {
        this.newDrives = [];
        var found = false;

        this.fsDrives.forEach(function (fsDrive) {
            self.drives.forEach(function (dbDrive) {
                if (dbDrive.value.drive == fsDrive.name) {
                    found = true;
                    return 1;
                }
            })
            if (!found) {
                self.newDrives.push(fsDrive);
            }
            else {
                found = false;
            }
        })
        if (this.newDrives.length) {
            return true;
        }

        return false;
    }

    this.saveNewDrives = function (drivesData) {
        this.dbModel.addDrives(this.formatDriveData(drivesData), function () {
            self.emit("drivesSaved");
        });
    }

    this.formatDriveData = function (driveData) {
        result = {};

        driveData.forEach(function (row) {
            result[row.name] = row.value;
        })

        return [result];
    }

    this.getNewDrives = function () {
        return this.newDrives;
    }

    this.mapStates = function (states) {
        result = [];
        var self = this;
        states.forEach(function (state) {

            var drive = self.getDriveByName(state.driveName);
            var status = self.getStatus(drive, state);
            result.push({
                name: drive.drive,
                state: status
            })
        })

        return result;
    }

    this.getDriveByName = function (driveName) {
        return this.driveByNames[driveName];
    }

    this.getStatus = function (drive, fsStates) {
        return fsStates.states[this.getSensorChannel(drive)];
    }

    this.getSensorChannel = function (drive) {
        return drive.channel_A == 'sensor' ? 'A' : 'B';
    }

    this.mapChannel = function (driveName, channel) {
        console.log('!!!!!!!!!', driveName);
        if (channel != 'A' && channel != 'B') {
            channel = this.fetchChannelByDriveName(driveName);
        }

        console.log('###########', channel);

        return channel;
    }

    this.fetchChannelByDriveName = function (driveName) {
        return this.driveByNames[driveName].channel_A == 'switcher' ? 'A' : 'B';
    }
}

util.inherits(DrivesController, EventEmitter);
module.exports = DrivesController;
