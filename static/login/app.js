// document
// 	.querySelector('.login-form')
// 	.addEventListener('submit', function (event) {
// 		event.preventDefault(); // Prevent the default form submission.

// 		// Create FormData from the form.
// 		var formData = new FormData(document.querySelector('.login-form'));

// 		// Ensure you're using the correct names as specified in your form.
// 		var username = formData.get('username');
// 		var password = formData.get('password');

// 		// Log to console for debugging purposes.
// 		console.log('Username: ', username, 'Password: ', password); // You can remove this line after confirming it works.

// 		// Now, proceed with the fetch request.
// 		fetch('/login', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify({
// 				username: username, // Using variables from FormData.
// 				password: password,
// 			}),
// 		})
// 			.then((response) => response.json())
// 			.then((data) => {
// 				console.log(data); // Handle your server response here.
// 				if (data.success) {
// 					//sweet alert
// 					Swal.fire({
// 						heightAuto: false,
// 						title: 'Login Successful',
// 						text: 'You will be redirected to the app',
// 						icon: 'success',
// 						showCancelButton: false,
// 						showConfirmButton: false,
// 						timer: 1500,
// 					});
// 					setTimeout(() => {
// 						window.location.href = '/main';
// 					}, 1500);
// 				} else {
// 					//sweet alert
// 					Swal.fire({
// 						heightAuto: false,
// 						title: 'Login Failed',
// 						text: 'Invalid Username or Password',
// 						icon: 'error',
// 						showCancelButton: false,
// 						showConfirmButton: true,
// 					});
// 				}
// 			})
// 			.catch((error) => {
// 				console.error('Error:', error);
// 				// Handle network errors or other errors not caught by response checks.
// 			});
// 	});

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
var firebaseConfig = {
	apiKey: 'AIzaSyCEXMwUMnAYuTlVDcU6DRIm2Vu60NomqJE',
	authDomain: 'bookify-f6b4b.firebaseapp.com',
	projectId: 'bookify-f6b4b',
	storageBucket: 'bookify-f6b4b.appspot.com',
	messagingSenderId: '458929369791',
	appId: '1:458929369791:web:90f16e20777b7f87d40c0a',
	measurementId: 'G-866WKH3GPY',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
document
	.querySelector('.login-form')
	.addEventListener('submit', function (event) {
		event.preventDefault(); // Prevent the default form submission.

		var username = document.getElementById('signInName').value;
		var password = document.getElementById('password').value;

		firebase
			.auth()
			.signInWithEmailAndPassword(username, password)
			.then((userCredential) => {
				// Signed in
				var user = userCredential.user;
				// Redirect or show success message
				Swal.fire({
					heightAuto: false,
					title: 'Login Successful',
					text: 'You will be redirected to the app',
					icon: 'success',
					showCancelButton: false,
					showConfirmButton: false,
					timer: 1500,
				});
				//send request to user with user.uid
				fetch('/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(user),
				}).then((response) =>
					response.json().then((data) => {
						//redirect to main page
						// Assuming login success
						const loginTime = new Date().getTime(); // Current time in milliseconds
						sessionStorage.setItem('sessionStartTime', loginTime.toString());

						setTimeout(() => {
							window.location.href = '/main';
						}, 1500);
					})
				);

				console.log(user);
			})
			.catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				// Show error message
				Swal.fire({
					heightAuto: false,
					title: 'Login Failed',
					text:
						'Invalid Username or Password ' + errorMessage + ' ' + errorCode,
					icon: 'error',
					showCancelButton: false,
					showConfirmButton: true,
				});
			});
	});
function googleSignIn() {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase
		.auth()
		.signInWithPopup(provider)
		.then(function (result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			// Redirect or show success message
		})
		.catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// Show error message
		});
}
