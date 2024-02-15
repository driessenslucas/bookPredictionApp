document.getElementById('searchButton').addEventListener('click', function () {
	console.log('Searching for books...');
	var query = document.getElementById('searchQuery').value;
	// Show the loading Swal
	Swal.fire({
		title: 'Searching...',
		text: 'Please wait while we find the books.',
		icon: 'info',
		showConfirmButton: false,
		allowOutsideClick: false,
		allowEscapeKey: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	fetch('/search?query=' + encodeURIComponent(query))
		.then((response) => response.json())
		.then((books) => {
			Swal.close();
			var resultsHTML = '';
			books.forEach((book) => {
				resultsHTML += `
        <div class="book ${book.isbn}" data-isbn="${book.isbn}" data-title="${
					book.title
				}" data-authors="${book.authors.join(',')}">
            <img src="${book.thumbnail}" alt="${book.title}" class="book-cover">
            <div class="book-details">
                <h3>${book.title}</h3>
                <p><b>Author(s):</b> ${book.authors.join(', ')}</p>
                <p><b>Publisher:</b> ${book.publisher}</p>
                <p><b>ISBN:</b> ${book.isbn}</p>
                <p><b>Published Date:</b> ${book.publishedDate}</p>
                <b>description:</b>
                <div class="c-description"><p>${book.description}</p></div>
            </div>
            <div class="rating-section">
                <div>
                    <input inputmode="numeric" type="number" min="1" max="5" placeholder="Rate 1-5" id="rating-${
											book.isbn
										}">
                    <button onclick="rateBook('${
											book.isbn
										}')">Submit Rating</button>
                </div>
                <a href="${
									book.infoLink
								}" target="_blank" class="more-info-link">More Info</a>
            </div>
            <div class="clear"></div>
        </div>
    `;
				document.getElementById('searchResults').innerHTML = resultsHTML;
			});
		})
		.catch((error) => {
			// If there's an error, close the Swal and show an error message
			Swal.fire({
				title: 'Error!',
				text: 'Something went wrong with the search.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
		});
});

function rateBook(bookId) {
	console.log('Rating book with ID: ' + bookId);

	var bookElement = document.getElementsByClassName(bookId)[0];
	//make a book and get the title, authors from data attributes
	var book = {
		isbn: bookElement.dataset.isbn,
		title: bookElement.dataset.title,
		authors: bookElement.dataset.authors.split(','),
		thumbnail: bookElement.querySelector('img').getAttribute('src'),
	};

	console.log(book);

	var rating = document.getElementById('rating-' + book.isbn).value;
	var data = {
		isbn: book.isbn,
		title: book.title,
		authors: book.authors,
		thumbnail: book.thumbnail,
		rating: rating,
	};
	fetch('/rate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((result) => {
			if (result.success) {
				// alert('Rating submitted successfully!');
				//use sweetalert2
				Swal.fire({
					heightAuto: false,
					title: 'Rating submitted successfully!',
					icon: 'success',
					showConfirmButton: false,
					timer: 1500,
				});
			} else {
				// alert('Failed to submit rating');
				//use sweetalert2
				Swal.fire({
					heightAuto: false,
					title: 'Failed to submit rating, please try again!',
					icon: 'error',
					showConfirmButton: false,
					timer: 1500,
				});
			}
		});
}

//listent to searchquery input submit on enter
document.getElementById('searchQuery').addEventListener('keyup', function (e) {
	if (e.key === 'Enter') {
		document.getElementById('searchButton').click();
	}
});
if (
	window.matchMedia &&
	window.matchMedia('(prefers-color-scheme: dark)').matches
) {
	document.body.setAttribute('data-theme', 'dark');
}
