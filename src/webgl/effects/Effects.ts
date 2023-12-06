import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { gl } from "../core/WebGL";
import { fxaa } from "./FXAA";
import { mouseInvert } from "./MouseInvert";
import { ugomemoHalftone } from "./UgomemoHalftone";
import { gui } from "../Gui";

class Effects {
	private composer!: EffectComposer;

	constructor() {
		this.init();
	}

	private init() {
		this.composer = new EffectComposer(gl.renderer);
		this.composer.setPixelRatio(window.devicePixelRatio);
		this.composer.addPass(new RenderPass(gl.scene, gl.camera));

		this.composer.addPass(fxaa.pass);
		const fxaaFolder = gui.addFolder("FXAA");
		fxaaFolder.add(fxaa.pass, "enabled").name("enabled");

		this.composer.addPass(mouseInvert.pass);
		mouseInvert.pass.enabled = false;
		const mouseInvertFolder = gui.addFolder("MouseInvert");
		mouseInvertFolder.add(mouseInvert.pass, "enabled").name("enabled");

		this.composer.addPass(ugomemoHalftone.pass);
		const ugomemoHalftoneFolder = gui.addFolder("UgomemoHalftone");
		ugomemoHalftoneFolder.add(ugomemoHalftone.pass, "enabled").name("enabled");
		ugomemoHalftoneFolder
			.add(ugomemoHalftone.pass.uniforms.u_pixelSize, "value", 0, 0.01, 0.0001)
			.name("pixelSize");
	}

	resize() {
		const { width, height } = gl.size;
		fxaa.update();
		this.composer.setSize(width, height);
	}

	render() {
		mouseInvert.update();
		ugomemoHalftone.update();
		this.composer.render();
	}
}

export const effects = new Effects();
