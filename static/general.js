const sessionStartTime = sessionStorage.getItem('sessionStartTime');
const currentTime = new Date().getTime();

if (sessionStartTime) {
	const sessionDuration = currentTime - parseInt(sessionStartTime);
	const maxSessionDuration = 30 * 60 * 1000; // For example, 30 minutes in milliseconds

	if (sessionDuration > maxSessionDuration) {
		// Session has exceeded the maximum duration
		alert('Session expired. Please log in again.');
		// Perform logout operations here
		fetch('/logout')
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
			});
		// Clear session storage to reset the session timer
		sessionStorage.clear();
	}
}
window.addEventListener('beforeunload', function (event) {
	// Perform any cleanup or server notifications here
	// Note: Modern browsers restrict many actions in this event for security and user experience reasons

	// Example: Send a synchronous XMLHttpRequest to notify the server about the session ending
	// Warning: Synchronous requests can harm the user experience and are generally discouraged
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/logout', false); // false makes the request synchronous
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify({ message: 'User session ended' }));

	// Optionally, you can display a confirmation dialog (not all browsers support this)
	// event.returnValue = "Are you sure you want to leave?";
});
//listent to searchquery input submit on enter
// document.getElementById('searchQuery').addEventListener('keyup', function (e) {
// 	if (e.key === 'Enter') {
// 		document.getElementById('searchButton').click();
// 	}
// });


document.addEventListener('DOMContentLoaded', function () {
	if (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		document.body.setAttribute('data-theme', 'dark');
	}
});