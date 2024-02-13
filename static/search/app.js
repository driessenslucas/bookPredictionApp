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
        <div class="book">
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
                    <input type="number" min="1" max="5" placeholder="Rate 1-5" id="rating-${
											book.isbn
										}">
                    <button onclick="rateBook('${book.isbn}','${
					book.title
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

function rateBook(bookId, bookTitle) {
	console.log('Rating book with ID: ' + bookId);
	var rating = document.getElementById('rating-' + bookId).value;
	var data = { isbn: bookId, title: bookTitle, rating: rating };
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

// document.addEventListener('DOMContentLoaded', (event) => {
// 	const bottomAppBarHeight =
// 		document.querySelector('.bottom-appbar').offsetHeight;

// 	const searchbar = document.querySelector('.c-searchbar');
// 	searchbar.style.bottom = `${110}px`;
// });
