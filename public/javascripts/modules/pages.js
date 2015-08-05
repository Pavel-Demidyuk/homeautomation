/**
 * Created by Pavel_Demidyuk on 25.11.2014.
 */
define(["jquery", "hogan"],
	function ($, hogan, header, footer) {

		var pageData,
			pageCallback,
			langPack;

		var processTemplate = function (templateName) {
			$.get(getTemplateUrl(templateName), function (templateContent) {
				displayPage(compilePage(templateContent));
				if (pageCallback) pageCallback();
			})
				.fail(function(){
					// @todo
					console.log("Template " + templateName + " could not be loaded");
				})
		}

		var displayPage = function (pageHtmlContent) {
			$("body").html(pageHtmlContent);
			componentHandler.upgradeDom();
		}

		var compilePage = function (rawTemplateContent) {
			var contentCompiled = hogan.compile(rawTemplateContent);
			var result = contentCompiled.render(pageData);
			return result;
		}

		var getTemplateUrl = function (templateName) {
			return '/views/' + templateName + '.hjs';
		}
		var getTxtUrl = function () {
			return '/config/text/' + getLang() + '/text.json';
		}

		var getLang = function () {
			return 'en';
		}

		return {
			render: function (pageName, inputData, callback) {
				var self = this;
				if (!langPack) {
					$.ajax({
						dataType: "json",
						url: getTxtUrl(),
						success: function(data) {
							langPack = data;
							self.render(pageName, inputData, callback);
						},
						fail: function(data) {console.log("Can't load language data")}
					});
				}

				pageData = inputData;
				pageData.txt = langPack;
				pageCallback = callback;
				processTemplate(pageName);
			}
		}
	})