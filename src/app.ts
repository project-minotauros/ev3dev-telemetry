import * as three from 'three';
import * as ImGui from 'imgui-js';
import * as ImGui_Impl from 'imgui-js/example/imgui_impl';

var camera, scene, renderer;
var mesh;

init();
animate();

function init() {

	camera = new three.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 5;

	scene = new three.Scene();

	var geometry = new three.BoxGeometry();
	var material = new three.MeshBasicMaterial( { color: 0x00ff00 } );

	mesh = new three.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new three.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	console.log (renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.01;

	renderer.render( scene, camera );

}