import * as ImGui from 'imgui-js';

export function debug_window(clear_color : any, mesh : any) {
	ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);

	ImGui.Begin("Debug");
	ImGui.ColorEdit3("clear color", clear_color);
	ImGui.Text(`Mesh x rotation: ${mesh.rotation.x.toString()}`);
	//ImGui.SliderFloat3("scale", mesh.scale, -2, 2);
	ImGui.Checkbox("visible", (value = mesh.visible) => mesh.visible = value);
	ImGui.End();
}
