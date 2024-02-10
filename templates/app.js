$('#imagePreview').click(function () {
	$('#fileInput').click();
});

$(document).ready(function () {
	$('#fileInput').change(function (e) {
		var reader = new FileReader();
		reader.onload = function (e) {
			// $('#imagePreview').attr('src', e.target.result).show();
			// set as background image for the image preview
			$('#imagePreview')
				.css('background-image', 'url(' + e.target.result + ')')
				.show();
			$('#uploadText').hide();
		};
		reader.readAsDataURL(e.target.files[0]);
	});

	$('#btnUpload').click(function () {
		$('#responseArea').hide();
		$('#loadingSpinner').show();
		var formData = new FormData();
		formData.append('file', $('#fileInput')[0].files[0]);

		$.ajax({
			url: '/upload-image',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function (data) {
				$('#loadingSpinner').hide();
				data = data.response;
				console.log(data);
				displayResponse(data);
			},
			error: function () {
				$('#loadingSpinner').hide();
				$('#responseArea')
					.html(
						"<div class='alert alert-danger'>Error processing the request.</div>"
					)
					.show();
			},
		});
	});

	function displayResponse(data) {
		// Ensure data is parsed as an object if it's a JSON string
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		var responseHTML = "<div class='alert alert-success'>";
		if (data && data.book_title) {
			responseHTML += '<h4>Book Title: ' + data.book_title + '</h4>';
			responseHTML += '<p>Predicted Rating: ' + data.predicted_rating + '</p>';
			responseHTML += '<p>Reason: ' + data.reason + '</p>';
		} else {
			responseHTML += '<p>No data to display.</p>';
		}
		responseHTML += '</div>';
		$('#responseArea').html(responseHTML).show();
	}
});
