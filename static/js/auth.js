var is_processing = false;

$("#register-btn").click(function() {
    var username = $("#username").val();
    var password = $("#password").val();
    var password2 = $("#password2").val();
    
    if (username.length < 3) {
        errorAnimation($("#username"));
        return;
    } else if (password.length < 3) {
        errorAnimation($("#password"));
        return;
    } else if (password != password2) {
        errorAnimation($("#password2"));
        return;
    } else if (is_processing) {
        return
    }

    is_processing = true;
    setLoading();

    $.post("/register", {
        username: username,
        password: password
    }, function(data) {
        if (data == "success") {
            window.location.href = "/";
        } else if (data == "username_taken") {
            errorAnimation($("#username"));
            setNormal("REGISTRUJ SE");
            is_processing = false;
            return
        }            
    });
});

$("#login-btn").click(function() {
    username = $("#username").val();
    password = $("#password").val();
    if (username.length < 3) {
        errorAnimation($("#username"));
        return;
    } else if (password.length < 3) {
        errorAnimation($("#password"));
        return;
    } else if (is_processing) {
        return;
    }

    is_processing = true;
    setLoading();

    $.post("/login", {
        username: username,
        password: password
    }, function(data) {
        if (data == "success") {
            window.location.href = "/";
        } else if (data == "invalid") {
            errorAnimation($("#password"));
            setNormal("PRIJAVI SE");
            is_processing = false;
            return;
        }
    });
});

function errorAnimation(elem) {
    anime({
        targets: elem.get(),
        color: ["#fff", "#ff0000"],
        keyframes: [
            {translateX: [0,-10]},
            {translateX: 10}
        ],
        duration: 150,
        easing: 'linear',
        direction: "alternate"
    })
}

function setLoading() {
    $(".form button").html(
        "<img src='static/media/loading.svg' height='50'>"
    )
}

function setNormal(txt) {
    $(".form button").html(
        txt
    )
}