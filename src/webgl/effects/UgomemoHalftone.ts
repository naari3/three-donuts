import * as THREE from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { gl } from "../core/WebGL";
import fragmentShader from "../shaders/ugomemoHalftoneFrag.glsl";
import vertexShader from "../shaders/ugomemoHalftoneVert.glsl";

class UgomemoHalftone {
	public pass: ShaderPass;

	constructor() {
		this.pass = this.createPass();
	}

	private createPass() {
		const shader: THREE.Shader = {
			uniforms: {
				tDiffuse: { value: null },
				u_pixelSize: { value: 0.001 },
				u_screenAspect: { value: gl.size.aspect },
			},
			vertexShader,
			fragmentShader,
		};
		return new ShaderPass(shader);
	}

	update() {
		this.pass.uniforms.u_screenAspect.value = gl.size.aspect;
	}
}

export const ugomemoHalftone = new UgomemoHalftone();
