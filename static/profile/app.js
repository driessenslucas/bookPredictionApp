// Function to fetch book details from Google Books API by ISBN
async function fetchBookDetails(isbn) {
	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
	);
	const data = await response.json();
	return data.items ? data.items[0].volumeInfo : null;
}

// Function to display rated books
async function displayRatedBooks() {
	// Fetch the user's ratings from your backend
	const userRatingsResponse = await fetch('/get-user-ratings');
	const userRatings = await userRatingsResponse.json();

	// Iterate over each rating and fetch book details
	for (const rating of userRatings) {
		const bookDetails = await fetchBookDetails(rating.isbn);
		if (bookDetails) {
			document.getElementById('ratedBooks').innerHTML += `
                        <div class="book">
                            <img src="${
															bookDetails.imageLinks.thumbnail
														}" alt="${bookDetails.title}">
                            <div class="book-info">
                                <h2>${bookDetails.title}</h2>
                                <p>Author(s): ${bookDetails.authors.join(
																	', '
																)}</p>
                                <p>Your Rating: ${rating.rating}</p>
                            </div>
                        </div>
                    `;
		}
	}
}

// Call the function to display rated books when the page loads
displayRatedBooks();
