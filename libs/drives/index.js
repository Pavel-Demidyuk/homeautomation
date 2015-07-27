var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DrivesController = function (dbModel) {

	var self = this;
	this.dbModel = dbModel;
	this.drives = [];
	this.fsDrives = [];
	this.newDrives = [];

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
			self.emit("drivesFetched", data);
		});
	}

	this.newDrivesAvailable = function () {
		this.newDrives = [];
		var found = false;
		this.fsDrives.forEach(function (fsDrive) {
			self.drives.forEach(function (drive) {
				if (drive.id == fsDrive.name) {
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

		console.log("|new drives", this.newDrives);

		if (this.newDrives.length) {
			return true;
		}

		return false;
	}

	this.saveNewDrives = function (drivesData) {
		this.dbModel.addDrives(this.extractDrivesData(drivesData), function(){
			self.emit("drivesSaved");
		});
	}

	this.extractDrivesData = function (drivesData) {
		var result = [];

		for (var i = 0; i < drivesData.length; i++) {
			var re = /(.*)\[(.*)\]/g;
			var info = re.exec(drivesData[i].name);
			if (!result[info[2]])
			{
				result[info[2]] = {"_id" : info[2]};
			}

			result[info[2]][info[1]] =  drivesData[i].value
		}
		var retValue = []
		for (var key in result) {
            if (!key) continue;
			retValue.push(result[key]);
		}
		return retValue;
	}

	this.getNewDrives = function () {
		return this.newDrives;
	}
}

util.inherits(DrivesController, EventEmitter);
module.exports = DrivesController;
