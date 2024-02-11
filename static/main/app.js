$(document).ready(function () {
	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
		$(this).toggleClass('active');

		//if sidebar is active disable the main content
		if ($('#sidebar').hasClass('active')) {
			$('.main-content').css('pointer-events', 'none');
			//make the main content look greyed out
			$('.main-content').css('background-color', 'rgba(0, 0, 0, 0.5)');
			$('.main-content').css('opacity', '0.5');
			$('.container').css('background-color', 'rgba(0, 0, 0, 0.5)');
			$('.container').css('opacity', '0.5');
		} else {
			$('.main-content').css('pointer-events', 'auto');
			$('.main-content').css('background-color', 'rgba(0, 0, 0, 0)');
			$('.main-content').css('opacity', '1');
			$('.container').css('background-color', 'rgba(0, 0, 0, 0)');
			$('.container').css('opacity', '1');
		}
	});
});
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
			$('#ResponseArea').hide();
		};
		reader.readAsDataURL(e.target.files[0]);
	});

	$('#btnUpload').click(function () {
		$('#responseArea').hide();

		Swal.fire('Please wait');
		Swal.showLoading();
		var formData = new FormData();
		formData.append('file', $('#fileInput')[0].files[0]);

		$.ajax({
			url: '/upload-image',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function (data) {
				Swal.close();
				data = data.response;
				console.log(data);
				displayResponse(data);
			},
			error: function () {
				Swal.close();
				$('#responseArea')
					.html(
						"<div class='alert alert-danger'>Error processing the request.</div>"
					)
					.show();
			},
		});
	});

	function displayResponse(data) {
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (e) {
				console.error('Parsing error:', e);
				$('#responseArea')
					.html(
						"<div class='alert alert-danger'>Error processing the request.</div>"
					)
					.show();
				return;
			}
		}

		var responseHTML = "<div class='alert alert-success'>";
		if (data && data.book_title) {
			responseHTML +=
				'<h4>Book Title: ' + $('<div>').text(data.book_title).html() + '</h4>';
			responseHTML +=
				'<p>Predicted Rating: ' +
				$('<div>').text(data.predicted_rating).html() +
				'</p>';
			responseHTML +=
				'<p>Reason: ' + $('<div>').text(data.reason).html() + '</p>';
		} else {
			responseHTML += '<p>No data to display.</p>';
		}
		responseHTML += '</div>';
		$('#responseArea').html(responseHTML).fadeIn();
	}
});
