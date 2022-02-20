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

w = 600
h = 300

var cnvs = document.getElementById("txtcanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x212121 );
const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 0, 1 );
scene.add( light );
const camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
camera.position.z = 2;
var renderer = new THREE.WebGLRenderer( { canvas: cnvs } );
renderer.setSize( w, h );

var model;
const loader = new THREE.GLTFLoader();
loader.load( 'static/media/txt.glb', function ( gltf ) {
	model = gltf.scene;
    var newMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
    model.traverse((o) => {
    if (o.isMesh) o.material = newMaterial;
    scene.add(model);
});

}, undefined, function ( error ) {

	console.error( error );

} );


//add orbit controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.10;
controls.minPolarAngle = -Math.PI / 2;
controls.maxPolarAngle = Math.PI;
controls.minAzimuthAngle = -Math.PI / 2;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update()


function animate() {

    //rotate the text
    if (model) {
        //scale model with sinus function
        model.scale.set(1 + Math.sin(Date.now() / 1000) / 10, 1 + Math.sin(Date.now() / 1000) / 10, 1 + Math.sin(Date.now() / 1000) / 10);
    }

    controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();