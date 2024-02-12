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
	$('#btnUpload').prop('disabled', true); // Disable upload button if no file is selected
	$('#fileInput').change(function (e) {
		// Check if any file is selected
		if (e.target.files.length > 0) {
			var reader = new FileReader();
			reader.onload = function (e) {
				// Set as background image for the image preview
				$('#imagePreview')
					.css('background-image', 'url(' + e.target.result + ')')
					.show();
				$('#uploadText').hide();
				$('#ResponseArea').hide();
			};
			reader.readAsDataURL(e.target.files[0]);
			$('#btnUpload').prop('disabled', false); // Enable upload button if file is selected
		} else {
			$('#btnUpload').prop('disabled', true); // Disable upload button if no file is selected
		}
	});

	$('#btnUpload').click(function () {
		$('#responseArea').hide();

		Swal.fire({
			heightAuto: false,
			title: 'Processing the image...',
			icon: 'info',
			showCancelButton: false,
			showConfirmButton: false,
		});

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
				//show in sweet alert
				Swal.fire({
					heightAuto: false,
					title: 'Error processing the request',
					icon: 'error',
					showCancelButton: false,
					showConfirmButton: true,
				});
				// $('#responseArea')
				// 	.html(
				// 		"<div class='alert alert-danger'>Error processing the request.</div>"
				// 	)
				// 	.show();
			},
		});
	});

	function displayResponse(data) {
		//show in sweet alert
		Swal.fire({
			heightAuto: false,
			title: `<strong>Predicted Rating: ${data.predicted_rating}</strong>`,
			html: `
	<div style="padding: 1em; background-color: #f7f7f7; border-radius: 5px; margin-to
	<p style="margin: 0; font-weight: bold;">${data.book_title}</p>
	<p style="margin: 0;">Reason: ${data.reason}</p>
	</div>
	`,
			icon: 'success',
			showCancelButton: false,
			showConfirmButton: true,
			confirmButtonText: 'OK',
			confirmButtonColor: '#3085d6', // Use a color that matches your site's theme.
			cancelButtonColor: '#d33',
			buttonsStyling: true,
			customClass: {
				popup: 'custom-swal',
			},
		});
	}
});
// on document load
document.addEventListener('DOMContentLoaded', function () {
	//clear upload input
	$('#fileInput').val('');
});
