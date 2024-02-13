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

				//ask user if they want to upload again or upload another image
				Swal.fire({
					heightAuto: false,
					title: 'Error processing!! do you want to try again?',
					icon: 'question',
					showCancelButton: true,
					confirmButtonText: 'Yes',
					cancelButtonText: 'No',
				}).then((result) => {
					if (result.isConfirmed) {
						//click the upload button
						document.querySelector('#btnUpload').click();
					} else {
						//redirect to the main page
						redirect('main');
					}
				});
			},
		});
	});

	function displayResponse(data) {
		//parse json
		data = JSON.parse(data);
		console.log(data);

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

// Function to check if the current page is 'main'
function isCurrentPageMain() {
	return (
		window.location.pathname.endsWith('/main') ||
		window.location.pathname === '/'
	);
}

// Function to change the tab image and behavior
function adjustMainTabBehavior() {
	var mainTab = document.querySelector('.main-tab');
	var fileInput = document.getElementById('fileInput');

	if (isCurrentPageMain()) {
		// Change the image source
		mainTab.querySelector('img').src = '/static/main/upload.svg'; // Update the path as needed

		// Adjust behavior to act like the upload button
		mainTab.onclick = function () {
			fileInput.click();
		};
	} else {
		// Reset to default behavior if not on the 'main' page
		mainTab.onclick = function () {
			redirect('main');
		};
	}
}

// Function to handle file input changes
document.getElementById('fileInput').addEventListener('change', function () {
	// Handle file selection...
	console.log('File selected');
	//sweet alert for confirmation
	Swal.fire({
		title: 'Are you sure?',
		text: 'You are about to upload an image',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, upload it!',
	})
		.then((result) => {
			if (result.isConfirmed) {
				//click confirm button
				document.querySelector('#btnUpload').click();
				// change the maintab to display a confirm button and make it click the upload button
				var mainTab = document.querySelector('.main-tab');
				mainTab.querySelector('img').src = '/static/main/confirm.svg'; // Update the path as needed

				mainTab.onclick = function () {
					document.querySelector('#btnUpload').click();
				};
			}
		})
		.then(() => {
			//reset the main tab
			adjustMainTabBehavior();
		});
});
// Existing functions...
function redirect(page) {
	//if current page is the same as the page to redirect to, do nothing
	if (window.location.pathname === `/main` && page === 'main') {
		return;
	} else {
		window.location
			? (window.location.href = `/${page}`)
			: window.location.replace(`/${page}`);
	}
}

function togglePopup() {
	var popup = document.getElementById('profile-popup');
	popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
}

window.onclick = function (event) {
	var popup = document.getElementById('profile-popup');
	if (!event.target.matches('.tab--right, .tab--right *')) {
		popup.style.display = 'none';
	}
};

// on document load
document.addEventListener('DOMContentLoaded', function () {
	//clear upload input
	$('#fileInput').val('');
	adjustMainTabBehavior();
});
