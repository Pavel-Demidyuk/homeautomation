define(["jquery", "bootstrap_switch", 'modules/drives_base'], function ($, bootstrapSwitch, drivesBase) {

	var io,
		driveIds = [],
		bindFlag = false;

	return {
		setIo: function (socket_io) {
			io = socket_io;
		},


		bindEvents: function () {
			drivesBase.bindEvents();
		},

		prepare: function () {
			drivesBase.fetchStates(driveIds);
			this.bindEvents();
			io.emit("drives:homePageRendered");
		},

		/**
		 * Cock magic
		 *
		 * @param drives
		 * @returns {{group: Array, noGroup: Array}}
		 */
		group: function (drives) {
			var groupsObj = [], groupsArray = [], noGroup = [];
			for (var i = 0; i < drives.length; i++) {
				if (drives[i].value.group) {
					if (!groupsObj[drives[i].value.group]) {
						groupsObj[drives[i].value.group] = {
							groupName: drives[i].value.group,
							drives: [drives[i]]
						}
					} else {
						groupsObj[drives[i].value.group].drives.push(drives[i]);
					}
				} else {
					noGroup.push(drives[i].value)
				}
				driveIds.push(drives[i].id);
			}

			for (var key in groupsObj) {
				groupsArray.push(groupsObj[key])
			}
			return {group: groupsArray, noGroup: noGroup};
		}
	}
});
