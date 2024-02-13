document
	.querySelector('.login-form')
	.addEventListener('submit', function (event) {
		event.preventDefault(); // Prevent the default form submission.

		// Create FormData from the form.
		var formData = new FormData(document.querySelector('.login-form'));

		// Ensure you're using the correct names as specified in your form.
		var username = formData.get('username');
		var password = formData.get('password');

		// Log to console for debugging purposes.
		console.log('Username: ', username, 'Password: ', password); // You can remove this line after confirming it works.

		// Now, proceed with the fetch request.
		fetch('/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username, // Using variables from FormData.
				password: password,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data); // Handle your server response here.
				if (data.success) {
					//sweet alert
					Swal.fire({
						heightAuto: false,
						title: 'Login Successful',
						text: 'You will be redirected to the app',
						icon: 'success',
						showCancelButton: false,
						showConfirmButton: false,
						timer: 1500,
					});
					setTimeout(() => {
						window.location.href = '/main';
					}, 1500);
				} else {
					//sweet alert
					Swal.fire({
						heightAuto: false,
						title: 'Login Failed',
						text: 'Invalid Username or Password',
						icon: 'error',
						showCancelButton: false,
						showConfirmButton: true,
					});
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				// Handle network errors or other errors not caught by response checks.
			});
	});

document.onload = function () {
	if (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		document.body.setAttribute('data-theme', 'dark');
	}
	// Hide success screen
	console.log('onload');
};
// Path: static/main/app.j
