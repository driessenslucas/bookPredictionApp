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

		// get upload type from main-content classlist
		var uploadType = document
			.querySelector('.main-content')
			.classList.contains('single-book-upload')
			? 'single'
			: 'multiple';

		if (uploadType == 'single') {
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
							//close the sweet alert and clear the upload input
							$('#fileInput').val('');
							swal.close();
							resetPage();
						}
					});
				},
			});
		} else if (uploadType == 'multiple') {
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
				url: '/upload-books',
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					Swal.close();
					data = data.response;
					console.log(data);
					displayRatedBooks(data);
				},
				error: function () {
					Swal.close();
					//show in sweet alert

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
							//close the sweet alert and clear the upload input
							$('#fileInput').val('');
							swal.close();
						}
					});
				},
			});
		}
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
	<div class="swal_text_box">
	<p style="margin: 0; font-weight: bold;">Book: ${data.book_title}</p>
	<p style="margin: 0;">${data.reason}</p>
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
	}).then((result) => {
		//check if confirm button is clicked
		if (result.isConfirmed) {
			//check classlist of main-content
			if (
				document
					.querySelector('.main-content')
					.classList.contains('single-book-upload')
			) {
				// show the main-content
				document.querySelector('.main-container').classList.remove('c-hidden');
				//hide the rated books
				document
					.querySelector('.books-found-container')
					.classList.add('c-hidden');
			} else {
				//reset the page
				resetAfterMultipleUpload();
			}
		}
	});
}

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
		heightAuto: false,
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
	} else if (page === 'logout') {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You will be logged out',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, log me out!',
		}).then((result) => {
			if (result.isConfirmed) {
				window.location.replace('/logout');
			}
		});
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
	if (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		document.body.setAttribute('data-theme', 'dark');
	}
	//clear upload input
	$('#fileInput').val('');
	adjustMainTabBehavior();
	document.querySelector('.main-content').style.display = 'none'; // Assuming .main-content is your existing single book upload screen
});

document
	.getElementById('singleBookUploadBtn')
	.addEventListener('click', function () {
		// Hide the choice screen and show the single book upload form
		document.querySelector('.choice-screen').style.display = 'none';
		document.querySelector('.main-content').style.display = 'block'; // Assuming .main-content is your existing single book upload screen
		document.querySelector('.main-content').classList.add('single-book-upload'); // Assuming .main-content is your existing single book upload screen
	});

document
	.getElementById('multipleBooksUploadBtn')
	.addEventListener('click', function () {
		// Hide the choice screen and show a new screen for multiple book uploads
		document.querySelector('.choice-screen').style.display = 'none';
		// You need to create a similar HTML structure for multiple book uploads
		document.querySelector('.main-content').style.display = 'block';
		document
			.querySelector('.main-content')
			.classList.add('multiple-book-upload'); // Assuming .main-content is your existing single book upload screen
	});

// Function to create book card HTML
function createBookCard(rating) {
	//parse the rating object
	rating = rating[0];
	console.log(rating);
	console.log(rating.title);
	return `
    <div class="col-md-6">
      <div class="book-card">
				<img src="${rating.thumbnail || ''}" alt="${rating.title}" class="book-cover">
        <div class="book-info">
          <h2 class="book-title">${rating.title}</h2>
          <p class="book-author">Author(s): ${rating.authors.join(', ')}</p>
          <p class="book-rating">Your Rating: ${rating.rating}</p>
          <button onclick="confirmSelection('${
						rating.thumbnail
					}')" class="btn btn-danger">choose</button>
        </div>
      </div>
    </div>
  `;
}

// Function to confirm deletion
function confirmSelection(thumbnail) {
	Swal.fire({
		heightAuto: false,
		title: 'Are you sure?',
		text: '',
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, I want to predict the rating!',
	}).then((result) => {
		if (result.isConfirmed) {
			// show the main-content
			document.querySelector('.main-container').classList.remove('c-hidden');
			//hide the rated books
			document
				.querySelector('.books-found-container')
				.classList.add('c-hidden');
			//get the image of the book and put it in the upload fom
			// $('#imagePreview').css('background-image', 'url(' + thumbnail + ')');
			//clear file input
			$('#fileInput').val('');
			//fill the file input with the image
			fetchImageServerSide(thumbnail);
		}
	});
}

function getFileFromBase64(string64, fileName) {
	const trimmedString = string64.replace('dataimage/jpegbase64', '');
	const imageContent = atob(trimmedString);
	const buffer = new ArrayBuffer(imageContent.length);
	const view = new Uint8Array(buffer);

	for (let n = 0; n < imageContent.length; n++) {
		view[n] = imageContent.charCodeAt(n);
	}
	const type = 'image/jpeg';
	const blob = new Blob([buffer], { type });
	return new File([blob], fileName, {
		lastModified: new Date().getTime(),
		type,
	});
}

function fetchImageServerSide(imageUrl) {
	fetch('/fetch-image', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ url: imageUrl }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				// Use the base64 image
				var base64Image = data.image;
				var imageUrl = `data:image/jpeg;base64,${base64Image}`;
				$('#imagePreview').css('background-image', `url(${imageUrl})`).show();
				$('#uploadText').hide();
				// If you're using an <img> tag instead:
				// document.getElementById('someImageElementId').src = imageUrl;

				uploadImageFromBlob(getFileFromBase64(base64Image, 'filename.jpg'));
			} else {
				console.error('Error fetching image:', data.message);
				// Handle failure
			}
		})
		.catch((error) => console.error('Error:', error));
}
// Function to upload image from blob
function uploadImageFromBlob(file) {
	Swal.fire({
		heightAuto: false,
		title: 'Processing the image...',
		icon: 'info',
		showCancelButton: false,
		showConfirmButton: false,
	});

	Swal.showLoading();
	var formData = new FormData();

	formData.append('file', file);

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
			Swal.fire({
				heightAuto: false,
				title: 'Error processing!! do you want to try again?',
				icon: 'question',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No',
			}).then((result) => {
				if (result.isConfirmed) {
					// hide the main content
					document
						.querySelector('.main-container')
						.classList.remove('c-hidden');
					//show the found books
					document
						.querySelector('.books-found-container')
						.classList.add('c-hidden');
				} else {
					//close the sweet alert and clear the upload input
					$('#fileInput').val('');
					swal.close();
					resetAfterMultipleUpload();
				}
			});
		},
	});
}

// Function to display rated books
async function displayRatedBooks(data) {
	//hide main content
	document.querySelector('.main-container').classList.add('c-hidden');
	//show the rated books
	document.querySelector('.books-found-container').classList.remove('c-hidden');
	console.log(data);
	//parse the data
	data = JSON.parse(data);
	for (const book of data) {
		//get books from the data
		console.log(book);
		query = book.title + ' ' + book.author;
		//search for the book
		fetch('/search?query=' + encodeURIComponent(query))
			.then((response) => response.json())
			.then((books) => {
				console.log(books);
				document.getElementById('ratedBooks').innerHTML +=
					createBookCard(books);
			});
	}
}

function resetPage() {
	//clear file input
	$('#fileInput').val('');
	//hide the main content
	document.querySelector('.main-container').classList.remove('c-hidden');
	document.querySelector('.books-found-container').classList.add('c-hidden');
	document
		.querySelector('.main-content')
		.classList.remove('single-book-upload');
	document
		.querySelector('.main-content')
		.classList.remove('multiple-book-upload');
	document.querySelector('.choice-screen').style.display = 'block';
	document.querySelector('.main-content').style.display = 'none';
}
function resetAfterMultipleUpload() {
	//clear file input
	$('#fileInput').val('');
	//hide the main content
	document.querySelector('.main-container').classList.add('c-hidden');
	document.querySelector('.books-found-container').classList.remove('c-hidden');
	document.querySelector('.main-content').classList.add('multiple-book-upload');
	document.querySelector('.choice-screen').style.display = 'none';
}
