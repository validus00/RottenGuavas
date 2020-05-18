function login() {
    $.ajax({
        url: '/login',
        type: 'PUT',
        data: $('#login').serialize(),
        success: function (results) {
            alert("Logged in.");
            window.location.replace("/");
        },
        error: function (results) {
            alert("Username/password incorrect.");
            window.location.replace("/login");
        }
    })
};