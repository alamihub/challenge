const scopes = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/admin.directory.group',
  'https://www.googleapis.com/auth/admin.directory.group.member',
]
function onSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
  console.log(error);
}
function renderButton() {
  gapi.signin2.render('signin', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}


/************************/
// const grpEmails = ['ger-teatchers@webmdtips.com', 'spn-teatchers@webmdtips.com']
// function authenticate() {
//   return gapi.auth2.getAuthInstance()
//       .signIn({scope: [
//         'https://www.googleapis.com/auth/admin.directory.user',
//         'https://www.googleapis.com/auth/admin.directory.group',
//         'https://www.googleapis.com/auth/admin.directory.group.member',
//       ]})
//       .then(function() { console.log("Sign-in successful"); },
//             function(err) { console.error("Error signing in", err); });
// }
// function loadClient() {
//   gapi.client.setApiKey("AIzaSyAmk15oPeAj6bPHsMX8F6YrawjlXErriNw");
//   return gapi.client.load("https://admin.googleapis.com/$discovery/rest?version=directory_v1")
//       .then(function() { console.log("GAPI client loaded for API"); },
//             function(err) { console.error("Error loading GAPI client for API", err); });
// }
// // Make sure the client is loaded and sign-in is complete before calling this method.
// function execute() {
//   return gapi.client.directory.groups.insert({
//     "resource": {
//       "email": "webmaster@webmdtips.com"
//     }
//   })
//       .then(function(response) {
//               // Handle the results here (response.result has the parsed body).
//               console.log("Response", response);
//             },
//             function(err) { console.error("Execute error", err); });
// }
// async function createGroup() {
// try {
//   for (email of grpEmails) {
//     const res = await gapi.client.directory.groups.insert({
//       "resource": {
//         "email": email,
//       }
//     })
//     console.log(res)
//   }

// } catch (error) {
//   console.log(error)
// }

// }

// async function createMembers(grpEmails, mbrEmails) {
// try {
//   for (email of mbrEmails) {
//     const res = await api.client.directory.members.insert({
//       "groupKey": grpEmails[0],
//       "resource": {
//         "email": email,
//       }
//     })
//     console.log(res)
//   }

// } catch (error) {
//   console.log(error)
// }

// }
// gapi.load("client:auth2", function() {
//   gapi.auth2.init({client_id: "601474678931-gql852udl99901f56bdhlsjrbounvroq.apps.googleusercontent.com"});
// });