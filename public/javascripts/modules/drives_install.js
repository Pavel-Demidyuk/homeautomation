define(["jquery", 'modules/drives_base'], function ($, drivesBase) {

	var io;

	return {
		setIo: function (socket_io) {
			io = socket_io;
		},

		prepare: function () {
			this.bindEvents();
			io.emit("drives:installPageRendered");
		},

		bindEvents: function () {
			drivesBase.bindEvents();

			// group add event
			$('select[data-name=drive-groups]').each(function (e, element) {
				$(element).change(function () {
					var driveId = $(this).data("drive");

					var selected = $(this).find(":selected").attr("name");
					if (selected == "add") {
						var newGroupName = prompt("Creating new group", "Group name");
						io.emit("groups:add", {
							name: newGroupName,
							driveId: driveId
						});
					}
				})
			})

			// submit
			$("#installDrives").submit(function (event) {
				io.emit("drives:save", $( this ).serializeArray());
				event.preventDefault();
			})
		},

		renderTypes: function (data) {
			$('select[data-name=drive-types]').each(function (e, element) { // each drive
				var driveAutoDetectedType = $(element).find('option:selected').attr("name");
				$(element).find('option').remove();
				for (var i = 0; i < data.types.length; i++) {
					if (data.types[i].name == driveAutoDetectedType) {
						var selected = 'selected'
					}
					else {
						var selected = '';
					}
					var option = '<option value="' + data.types[i].name + '" ' + selected + '>' + data.types[i].title + '</option>';
					$(element).append(option);
				}

			})
		},

		renderGroups: function (data) {
			$('select[data-name=drive-groups]').each(function (e, element) { // each drive
				for (var i = 0; i < data.length; i++) {
					var driveId = $(element).data("drive"),
						selected = "";
					if (driveId == data[i].value) {
						selected = "selected"
					}

					if (!$(element).find("option[value='" + data[i].key + "']").length) {
						var option = '<option value="' + data[i].key + '" ' + selected + '>' + data[i].key + '</option>';
						$(element).append(option);
					}
				}
			})
		}
	}
});
