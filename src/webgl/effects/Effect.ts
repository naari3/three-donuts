import type { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

interface Effect {
	pass: ShaderPass;
	update(): void;
}

export type { Effect };
