async function fetchBookDetails(isbn) {
	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
	);
	const data = await response.json();
	return data.items ? data.items[0].volumeInfo : null;
}

// Function to create book card HTML
function createBookCard(rating) {
	//parse the rating object
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
          <button onclick="confirmDelete('${
						rating.isbn
					}')" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  `;
}

// Function to confirm deletion
function confirmDelete(isbn) {
	Swal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, delete it!',
	}).then((result) => {
		if (result.isConfirmed) {
			deleteRating(isbn);
		}
	});
}

// Function to call Flask backend to delete rating
async function deleteRating(isbn) {
	try {
		const response = await fetch('/remove-rating', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ isbn: isbn }),
		});
		const data = await response.json();
		if (data.success) {
			Swal.fire('Deleted!', 'Your rating has been deleted.', 'success');
			// Remove the book card from the display or refresh the rated books
			//refresh the page
			location.reload();
		} else {
			Swal.fire('Error!', 'There was a problem deleting your rating.', 'error');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

// Function to display rated books
async function displayRatedBooks() {
	const userRatingsResponse = await fetch('/get-user-ratings');
	const userRatings = await userRatingsResponse.json();
	for (const rating of userRatings) {
		console.log(rating);
		document.getElementById('ratedBooks').innerHTML += createBookCard(rating);
	}
}

// // Call the function on page load
displayRatedBooks();
// if (
// 	window.matchMedia &&
// 	window.matchMedia('(prefers-color-scheme: dark)').matches
// ) {
// 	document.body.setAttribute('data-theme', 'dark');
// }
