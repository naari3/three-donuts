import * as THREE from "three";
import { gl } from "./core/WebGL";
import { effects } from "./effects/Effects";
import fragmentShader from "./shaders/planeFrag.glsl";
import vertexShader from "./shaders/planeVert.glsl";
import { Assets, loadAssets } from "./utils/assetLoader";
import { calcCoveredTextureScale } from "./utils/coveredTexture";
// import { controls } from "./utils/OrbitControls";
import { gui } from "./Gui";

const velocity = new THREE.Vector3(0, 0, 0);
const rollingFacotr = {
	velocity: 0.15,
	damping: 0.98,
};
const rollingFolder = gui.addFolder("Rolling");
rollingFolder.add(rollingFacotr, "velocity", 0, 0.3, 0.01).name("scale");
rollingFolder.add(rollingFacotr, "damping", 0, 1, 0.0001).name("damping");

export class TCanvas {
	private assets: Assets = {
		image: { path: "resources/unsplash.jpg" },
	};

	constructor(private parentNode: ParentNode) {
		loadAssets(this.assets).then(() => {
			this.init();
			this.createObjects();
			gl.requestAnimationFrame(this.anime);
		});
	}

	private init() {
		gl.setup(this.parentNode.querySelector(".three-container")!);
		gl.scene.background = new THREE.Color("black");
		gl.camera.position.z = 1.5;

		gl.setResizeCallback(() => effects.resize());
	}

	private createObjects() {
		const texture = this.assets.image.data as THREE.Texture;

		const geometry = new THREE.PlaneGeometry(1.5, 1);

		const screenAspect = geometry.parameters.width / geometry.parameters.height;
		const [scaleWidth, scaleHeight] = calcCoveredTextureScale(
			texture,
			screenAspect,
		);

		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_image: {
					value: {
						texture,
						coveredScale: new THREE.Vector2(scaleWidth, scaleHeight),
					},
				},
				u_time: { value: 0 },
			},
			vertexShader,
			fragmentShader,
			side: THREE.DoubleSide,
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = "plane";
		mesh.visible = false;
		gl.scene.add(mesh);

		const donut = new THREE.TorusGeometry(0.3, 0.1, 16, 100);
		const donutMaterial = new THREE.MeshBasicMaterial({ color: "white" });
		const donutMesh = new THREE.Mesh(donut, donutMaterial);
		donutMesh.position.set(0, 0, 0);
		donutMesh.name = "donut";
		gl.scene.add(donutMesh);

		gl.addHoverFunction(donutMesh.uuid, (e) => {
			const mouseDelta = new THREE.Vector2(
				e.movementX / window.innerWidth,
				-e.movementY / window.innerHeight,
			).multiplyScalar(2.5);
			velocity.x += mouseDelta.x * rollingFacotr.velocity;
			velocity.y += -mouseDelta.y * rollingFacotr.velocity;
		});
		gl.addEnterFunction(donutMesh.uuid, () => {});
		gl.addLeaveFunction(donutMesh.uuid, () => {});
	}

	// ----------------------------------
	// animation
	private anime = () => {
		const plane = gl.getMesh<THREE.ShaderMaterial>("plane");
		plane.material.uniforms.u_time.value += gl.time.delta;

		velocity.multiplyScalar(rollingFacotr.damping);
		const donut = gl.getMesh<THREE.MeshBasicMaterial>("donut");
		donut.applyQuaternion(
			new THREE.Quaternion().setFromEuler(
				new THREE.Euler(velocity.y * 3.0, velocity.x * 3.0, 0.01),
			),
		);

		// controls.update();
		// gl.render()
		effects.render();
	};

	// ----------------------------------
	// dispose
	dispose() {
		gl.dispose();
	}
}
