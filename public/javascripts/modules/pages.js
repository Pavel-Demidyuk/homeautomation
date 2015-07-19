/**
 * Created by Pavel_Demidyuk on 25.11.2014.
 */
define(["jquery", "hogan"],
	function ($, hogan, header, footer) {

		var pageData,
			pageCallback;

		var processTemplate = function (templateName) {
			$.get(getTemplateUrl(templateName), function (templateContent) {
				displayPage(compilePage(templateContent));
				if (pageCallback) pageCallback();
			})
				.fail(function(){
					console.log("Template " + templateName + " could not be loaded");
				})
		}

		var displayPage = function (pageHtmlContent) {
			$("body").html(pageHtmlContent);
		}

		var getTemplateUrl = function (templateName) {
			return '/views/' + templateName + '.hjs';
		}

		var compilePage = function (rawTemplateContent) {
			var contentCompiled = hogan.compile(rawTemplateContent);
			var result = contentCompiled.render(pageData);

			return result;
		}

		return {
			render: function (pageName, inputData, callback) {
				pageData = inputData;
				pageCallback = callback;
				processTemplate(pageName);
			}
		}
	})