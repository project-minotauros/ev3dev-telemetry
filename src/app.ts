import * as THREE from 'three';
import * as ImGui from 'imgui-js';
import * as ImGui_Impl from 'imgui-js/example/imgui_impl';

import {debug_window} from './debug';
import {initialize_popup} from './initial_configuration';

var camera: any, scene: any, renderer: any;
var mesh: any;
var clear_color: any;

var socket: any;
var state: any = {
  ready: false
};

var cpanel_state: any = {
  ports: false,
  leds: false,
  battery_info: false,
  audio_controls: false,
  display: false,
  console: false
};

main().catch(err => console.log(err));

async function main(): Promise<void> {
	await ImGui.default();

	init();
	animate(0);
}

function init() {
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 500;

	scene = new THREE.Scene();
	scene.add(camera);

  var object_loader = new THREE.ObjectLoader();
  object_loader.load('assets/model/ev3.json', (model: any) => {
    mesh = model;
    scene.add(mesh);
  }, undefined, (err: any) => console.log(err));

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.domElement.setAttribute("tabindex", "1");
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	ImGui.CreateContext();
	ImGui_Impl.Init(renderer.domElement);
	ImGui.StyleColorsDark();

	clear_color = new ImGui.ImVec4(0.6, 1.0, 0.4, 1.00);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(time: number) {
	ImGui_Impl.NewFrame(time);
	ImGui.NewFrame();

  initialize_popup(state, socket);

  if (!(mesh === undefined))
    debug_window(clear_color, mesh);

	ImGui.EndFrame();
	ImGui.Render();

  if(!(mesh === undefined)) {
	  mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
  }

	renderer.setClearColor(new THREE.Color(clear_color.x, clear_color.y, clear_color.z), 1.0);
	renderer.render( scene, camera );
	ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

	renderer.state.reset();

	requestAnimationFrame( animate );
}
