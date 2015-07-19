var imgpath = "uploads/test3/"
var jsonfilepath = imgpath+"data.json"

var viewer = new Cesium.Viewer('cesiumContainer', {
    animation : false,
    baseLayerPicker : false,
    fullscreenButton : true,
    geocoder : false,
    homeButton : false,
    infoBox : false,
    sceneModePicker : false,
    selectionIndicator : false,
    timeline : false,
    terrainProvider : new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
    })
});

function find_width() {
    return [window.innerWidth, window.innerHeight];
}

function show_image(src) {
    var img = document.getElementById("fullscreenImage");
    if (img == null) {
        img = document.createElement("img");
        img.id = "fullscreenImage";
        document.body.appendChild(img);
    }
    img.id = "fullscreenImage";
    img.src = src;
    img.alt = "image";
}

function remove_image() {
    var img = document.getElementById("fullscreenImage");
    if (img !== null) {
        img.parentNode.removeChild(img);
    }
}

function set_destination (location_data) {
    var lat_shift = Cesium.Math.toRadians(0.015)
    var const_height = 5000 // meters
    var pos = {
        destination : Cesium.Cartesian3.fromRadians(
                              location_data.longitude,
                              location_data.latitude-lat_shift,
                              5000),
        orientation : {
        heading : Cesium.Math.toRadians(0),
        pitch : Cesium.Math.toRadians(-45),
        roll : location_data.roll
        },
        duration: 3,
        complete : show_next_image,
    }
    return pos
}

function set_view_destination (location_data) {
    var pos = {
        destination : Cesium.Cartesian3.fromRadians(
                              location_data.longitude,
                              location_data.latitude,
                              location_data.height),
        orientation : {
        heading : location_data.heading,
        pitch : location_data.pitch,
        roll : location_data.roll
        },
        duration: 3,
        complete : show_next_image,
    }
    return pos
}

function show_next_image () {
    show_image(imgpath+locations[loc].filename)
}

function zoom_rectangle (rect, zoom_factor) {
    return new Cesium.Rectangle(
        rect.west - rect.width * zoom_factor,
        rect.south - rect.height * zoom_factor,
        rect.east + rect.width * zoom_factor,
        rect.north + rect.height * zoom_factor
    )
}

function set_overview () {
    var point_array = [];
    for (var i=0; i < locations.length; i++){
        point_array.push(Cesium.Cartographic.fromRadians(locations[i].longitude,locations[i].latitude))
    }
    var minimal_dest = Cesium.Rectangle.fromCartographicArray(point_array);
    var dest = zoom_rectangle(minimal_dest, 0.3); // Zoom out overview by 30%.
    var pos = {
        destination : dest,
        orientation : {
        heading : Cesium.Math.toRadians(0),
        pitch : Cesium.Math.toRadians(-90),
        roll : 0,
        },
        duration: 3,
    }
    return pos
}


viewer.camera.frustum.fov = 2
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10

function add_markers() {
for (var i=0; i < locations.length; i++){
    var entity = viewer.entities.add({
        position : Cesium.Cartesian3.fromRadians(locations[i].longitude, locations[i].latitude),
        label : {
            text : '',
            verticalOrigin : Cesium.VerticalOrigin.TOP
        },
        billboard : {
            image : 'point.png',
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
        }
    });
}
}

function reqListener () {
    locations = JSON.parse(this.responseText);
    add_markers()
}

var oReq = new XMLHttpRequest();
oReq.onload = reqListener;
oReq.open("get", jsonfilepath, true);
oReq.send();

loc = -1
document.addEventListener('keydown', function(e) {
    switch(e.keyCode){
    case 'I'.charCodeAt(0):
       show_image(imgpath+locations[loc].filename);
       break;
    case 'M'.charCodeAt(0):
        remove_image();
        break;
    case 'N'.charCodeAt(0):
        remove_image();
        loc++;
        if (loc >= locations.length) {
            loc = 0;
        }
        viewer.camera.flyTo(set_destination(locations[loc]));
        break;
    case 'V'.charCodeAt(0):
        remove_image();
        loc++;
        if (loc >= locations.length) {
            loc = 0;
        }
        viewer.camera.flyTo(set_view_destination(locations[loc]));
        break;
    case 'C'.charCodeAt(0):
        remove_image();
        loc--;
        if (loc == -1) {
            loc = locations.length-1;
        }
        viewer.camera.flyTo(set_view_destination(locations[loc]));
        break;
    case 'O'.charCodeAt(0):
        remove_image();
        viewer.camera.flyTo(set_overview());
        break;
    case 'P'.charCodeAt(0):
        camera_data = {
            longitude : viewer.camera.positionCartographic.longitude,
            latitude : viewer.camera.positionCartographic.latitude,
            height : viewer.camera.positionCartographic.height,
            pitch : viewer.camera.pitch,
            heading : viewer.camera.heading,
            roll : viewer.camera.roll,
            filename : locations[loc].filename,
            folder : imgpath
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://192.168.1.222:5000/update_json");
        //xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(camera_data));
        break;
    }
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
        flags[flagName] = true;
    }
}, false);


// Keybindings for navigation

var flags = {
    moveForward : false,
    moveBackward : false,
    moveUp : false,
    moveDown : false,
    moveLeft : false,
    moveRight : false,
    twistLeft : false,
    twistRigt : false
};

function getFlagForKeyCode(keyCode) {
    switch (keyCode) {
    case 37:
        return 'lookLeft';
    case 38:
        return 'lookDown';
    case 39:
        return 'lookRight';
    case 40:
        return 'lookUp';
    case 'W'.charCodeAt(0):
        return 'moveForward';
    case 'S'.charCodeAt(0):
        return 'moveBackward';
    case 'Q'.charCodeAt(0):
        return 'twistLeft';
    case 'E'.charCodeAt(0):
        return 'twistRight';
    case 'D'.charCodeAt(0):
        return 'moveRight';
    case 'A'.charCodeAt(0):
        return 'moveLeft';
    case 'Z'.charCodeAt(0):
        return 'moveUp';
    case 'X'.charCodeAt(0):
        return 'moveDown';
    default:
        return undefined;
    }
}

document.addEventListener('keyup', function(e) {
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
        flags[flagName] = false;
    }
}, false);

viewer.clock.onTick.addEventListener(function(clock) {
    var camera = viewer.camera;
    // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
    var moveRate = cameraHeight / 100.0;
    var lookRate = 0.01;
    if (flags.twistLeft) {camera.twistLeft(lookRate);}
    if (flags.twistRight) {camera.twistRight(lookRate);}
    if (flags.lookLeft) {camera.lookLeft(lookRate);}
    if (flags.lookUp) {camera.lookUp(lookRate);}
    if (flags.lookRight) {camera.lookRight(lookRate);}
    if (flags.lookDown) {camera.lookDown(lookRate);}
    if (flags.moveForward) {camera.moveForward(moveRate);}
    if (flags.moveBackward) {camera.moveBackward(moveRate);}
    if (flags.moveUp) {camera.moveUp(moveRate);}
    if (flags.moveDown) {camera.moveDown(moveRate);}
    if (flags.moveLeft) {camera.moveLeft(moveRate);}
    if (flags.moveRight) {camera.moveRight(moveRate);}
});

