import * as three from 'three';
import * as ImGui from 'imgui-js';
import * as ImGui_Impl from 'imgui-js/example/imgui_impl';

var camera: any, scene: any, renderer: any;
var mesh: any;
var clear_color: any;

main().catch(err => console.log(err));

async function main(): Promise<void> {
	await ImGui.default();

	// renderer = new three.WebGLRenderer( { antialias: true } );
	// document.body.appendChild( renderer.domElement );
	console.log("imgui: ", ImGui);
	init();
	animate(0);
}

console.log('hello world');




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

	ImGui.CreateContext();
	ImGui_Impl.Init(renderer.domElement);
	ImGui.StyleColorsDark();
	clear_color = new ImGui.ImVec4(0.3, 0.3, 0.3, 1.00);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate(time: number) {
	ImGui_Impl.NewFrame(time);
	ImGui.NewFrame();

	ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);

	ImGui.Begin("Debug");
	ImGui.ColorEdit4("clear color", clear_color);
	ImGui.Text(`Mesh x rotation: ${mesh.rotation.x.toString()}`);
	//ImGui.SliderFloat3("scale", mesh.scale, -2, 2);
	ImGui.End();

	ImGui.EndFrame();
	ImGui.Render();

	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.01;

	renderer.setClearColor(new three.Color(clear_color.x, clear_color.y, clear_color.z), clear_color.w);
	renderer.render( scene, camera );
	ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

	requestAnimationFrame( animate );
}