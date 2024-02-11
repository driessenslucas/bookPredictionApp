// // Function to fetch book details from Google Books API by ISBN
// async function fetchBookDetails(isbn) {
// 	const response = await fetch(
// 		`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
// 	);
// 	const data = await response.json();
// 	return data.items ? data.items[0].volumeInfo : null;
// }

// // Function to display rated books
// async function displayRatedBooks() {
// 	// Fetch the user's ratings from your backend
// 	const userRatingsResponse = await fetch('/get-user-ratings');
// 	const userRatings = await userRatingsResponse.json();

// 	// Iterate over each rating and fetch book details
// 	for (const rating of userRatings) {
// 		const bookDetails = await fetchBookDetails(rating.isbn);
// 		if (bookDetails) {
// 			document.getElementById('ratedBooks').innerHTML += `
//                         <div class="book">
//                             <img src="${
// 															bookDetails.imageLinks.thumbnail
// 														}" alt="${bookDetails.title}">
//                             <div class="book-info">
//                                 <h2>${bookDetails.title}</h2>
//                                 <p>Author(s): ${bookDetails.authors.join(
// 																	', '
// 																)}</p>
//                                 <p>Your Rating: ${rating.rating}</p>
//                             </div>
//                         </div>
//                     `;
// 		}
// 	}
// }

// // Call the function to display rated books when the page loads
// displayRatedBooks();

// Sample books data, replace with the actual AJAX call to fetch user-rated books
const books = [
	{
		cover: 'path_to_de_nix_cover.jpg',
		title: 'De Nix',
		author: 'Nathan Hill',
		rating: 3,
	},
	{
		cover: 'path_to_gallant_cover.jpg',
		title: 'Gallant',
		author: 'V.E. Schwab',
		rating: 1,
	},
	// ... add more books as necessary
];

async function fetchBookDetails(isbn) {
	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
	);
	const data = await response.json();
	return data.items ? data.items[0].volumeInfo : null;
}

// Function to create book card HTML
function createBookCard(book, rating) {
	return `
    <div class="col-md-6">
      <div class="book-card">
        <img src="${book.imageLinks.thumbnail}" alt="${
		book.title
	}" class="book-cover">
        <div class="book-info">
          <h2 class="book-title">${book.title}</h2>
          <p class="book-author">Author(s): ${book.authors.join(', ')}</p>
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
		const bookDetails = await fetchBookDetails(rating.isbn);
		if (bookDetails) {
			document.getElementById('ratedBooks').innerHTML += createBookCard(
				bookDetails,
				rating
			);
		}
	}
}

// Call the function on page load
displayRatedBooks();
