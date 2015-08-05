define(['modules/drives_base', "jquery", "typeahead"], function (drivesBase, $) {
	var io;

	return {

		setIo: function (socket_io) {
			io = socket_io;
		},

		prepare: function () {
			this.bindEvents();
			io.emit("drives:installPageRendered");
		},

		typeaheadInit: function(data) {
			var rooms = [];
			for (var i=0; i<data.length; i++) {

				rooms.push(data[i].key);
			}
			var substringMatcher = function(strs) {
				return function findMatches(q, cb) {
					var matches, substringRegex;

					// an array that will be populated with substring matches
					matches = [];

					// regex used to determine if a string contains the substring `q`
					substrRegex = new RegExp(q, 'i');

					// iterate through the pool of strings and for any string that
					// contains the substring `q`, add it to the `matches` array
					$.each(strs, function(i, str) {
						if (substrRegex.test(str)) {
							matches.push(str);
						}
					});

					cb(matches);
				};
			};

			$('.typeahead').typeahead({
					hint: true,
					highlight: true,
					minLength: 1
				},
				{
					name: 'rooms',
					source: substringMatcher(rooms)
				});
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
