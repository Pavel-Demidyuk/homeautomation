define(["jquery"], function ($) {

	var io,
		bindFlag = false;

	return {
		setIo: function (socket_io) {
			io = socket_io;
		},

		bindEvents: function () {
			if (bindFlag) {
				return;
			}

			this.bindSwitcher();

			bindFlag = true;
		},

		bindSwitcher: function() {
			// switch drive
			$('.mdl-switch').each(function (e, element) {
				var driveId = $(element).closest("form").data("drive");

				var checkbox = $(element).find("input");
				$(checkbox).on('change', function () {
					var options = {
						id: driveId,
						channel: checkbox.data("channel"),
						state: checkbox.prop("checked")
					};
					io.emit("drives:userSwitch", options);
				});
			});
		},

		findSwitchByDriveId: function (driveId) {
			return $('input.dimension-switch[data-drive="' + driveId + '"]').bootstrapSwitch('state', true, true);
		},

		serverSwitch: function (data) {
			var element = $('input[data-drive="' + data.name + '"]');
			element.bootstrapSwitch('state', data.state, true);
		},

		fetchStates: function (driveIds) {
			io.emit("drives:fetchStates", driveIds);
		},

		updateStates: function (drives) {
			console.log(drives);

			for (var key in drives) {
				this.singleDriveStateUpdate(drives[key].id, drives[key].state);
			}
		},

		singleDriveStateUpdate: function (driveId, state) {
			$(this.findSwitchByDriveId(driveId)).bootstrapSwitch('disabled', false);
			$(this.findSwitchByDriveId(driveId)).bootstrapSwitch('state', state, true);
		}
	}
});
