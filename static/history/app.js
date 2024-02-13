// window.onload = function () {
//     fetch('/search-history')
//         .then((response) => response.json())
//         .then((data) => {
//             const tbody = document.getElementById('searchHistoryBody');

//             data.forEach((record) => {
//                 // Parse the openai_response from string to object
//                 let openaiResponse;
//                 try {
//                     openaiResponse = JSON.parse(record.openai_response);
//                 } catch (error) {
//                     console.log(
//                         'error while paring file with timestamp:',
//                         record.timestamp,
//                         error
//                     );
//                 }
//                 const tr = document.createElement('tr');
//                 tr.innerHTML = `
//         <td>${record.timestamp}</td>
//         <td>${openaiResponse.book_title}</td>
//         <td>${openaiResponse.predicted_rating}</td>
//         <td>${openaiResponse.reason}</td>
//     `;
//                 tbody.appendChild(tr);
//             });
//         })
//         .catch((error) =>
//             console.error('Error loading search history:', error)
//         );
// };
function formatTimestamp(timestamp) {
	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	};
	const date = new Date(timestamp);
	return date.toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', function () {
	// Show the loading Swal
	Swal.fire({
		title: 'Loading search history...',
		text: 'Please wait while we retrieve your past searches.',
		icon: 'info',
		showConfirmButton: false,
		allowOutsideClick: false,
		allowEscapeKey: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	fetch('/search-history')
		.then((response) => response.json())
		.then((searches) => {
			searches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			Swal.close();
			var resultsHTML = '';
			searches.forEach((search) => {
				let bookTitle, predictedRating, reason;
				try {
					// Attempt to parse the openai_response if it's a string
					console.log(search.openai_response);
					const openaiResponse =
						typeof search.openai_response === 'string'
							? JSON.parse(search.openai_response)
							: search.openai_response;
					bookTitle = openaiResponse.book_title;
					predictedRating = openaiResponse.predicted_rating;
					reason = openaiResponse.reason;
				} catch (e) {
					console.error('Failed to parse openai_response:', e);
					bookTitle = 'Unknown';
					predictedRating = 'Unknown';
					reason = 'No reason available';
				}
				resultsHTML += `
                <div class="book">
                    <img src="${
											search.image_base64
										}" alt="${bookTitle}" class="book-cover">
                    <div class="book-details">
                        <h3>${bookTitle}</h3>
                        <p><b>Predicted rating:</b> ${predictedRating}</p>
                        <p><b>Search Date:</b> ${formatTimestamp(
													search.timestamp
												)}</p>
                        <b>Reason:</b>
                        <div class="c-description"><p>${reason}</p></div>
                    </div>
                 </div>
                `;
			});
			document.getElementById('searchHistory').innerHTML = resultsHTML;
		})
		.catch((error) => {
			Swal.fire({
				title: 'Error!',
				text: 'Something went wrong while loading your search history.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
			console.error('Error fetching search history:', error);
		});
});
