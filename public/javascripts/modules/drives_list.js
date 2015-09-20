define(["jquery", 'modules/drives_base'], function ($, drivesBase) {

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
			io.emit("drives:homePageRendered");
			this.bindEvents();
			drivesBase.fetchStates(driveIds);
		},

		/**
		 * Cock magic
		 *
		 * @param drives
		 * @returns {{group: Array, noGroup: Array}}
		 */
		group: function (drives) {
			var groupsObj = [], roomsArray = [], noRoom = [];
			var active = true;
			for (var i = 0; i < drives.length; i++) {
				if (drives[i].value.room) {
					if (!groupsObj[drives[i].value.room]) {
						groupsObj[drives[i].value.room] = {
							room: drives[i].value.room,
							roomNum: i,
							active: active,
							drives: [drives[i]]
						}
						if (active) {
							active = false;
						}
					} else {
						groupsObj[drives[i].value.room].drives.push(drives[i]);
					}
				} else {
					noRoom.push(drives[i].value)
				}
				driveIds.push(drives[i].value.drive);
			}

			for (var key in groupsObj) {
				roomsArray.push(groupsObj[key])
			}
			return {rooms: roomsArray, noRoom: noRoom};
		},
		updateRoomBadges: function (states) {
			for (var key in states) {
				var roomNum = this.findDriveRoomNum(states[key].name);
				var badgeElement = $('.mdl-badge[data-room="' + roomNum + '"]');
				var badgeValue = badgeElement.attr('data-badge') ? parseInt(badgeElement.attr('data-badge')) : 0;
				if (states[key].state) {
					badgeElement.attr('data-badge', badgeValue + 1);
				}
			}
		},

		findDriveRoomNum: function (driveName) {
			return drivesBase.getSwitcher(driveName).closest('section').data('room');
		},
	}
});
