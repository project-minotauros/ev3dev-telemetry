import * as ImGui from 'imgui-js';

export function debug_window(clear_color : any, mesh : any) {
	ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);

	ImGui.Begin("Debug");
	ImGui.ColorEdit3("clear color", clear_color);
	ImGui.Text(`Mesh x rotation: ${mesh.rotation.x.toString()}`);
  ImGui.Text(`Application average ${(1000.0 / ImGui.GetIO().Framerate).toFixed(3)} ms/frame\n(${ImGui.GetIO().Framerate.toFixed(1)} FPS)`);
	//ImGui.SliderFloat3("scale", mesh.scale, -2, 2);
	ImGui.Checkbox("visible", (value = mesh.visible) => mesh.visible = value);
	ImGui.End();
}
