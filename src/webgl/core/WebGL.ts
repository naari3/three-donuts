import * as THREE from "three";

class WebGL {
	public renderer: THREE.WebGLRenderer;
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	public time = { delta: 0, elapsed: 0 };

	private raycaster = new THREE.Raycaster();
	private mouse = new THREE.Vector2();
	private hoverFunctions: { [key: string]: (e: MouseEvent) => void } = {};
	private enterFunctions: { [key: string]: (e: MouseEvent) => void } = {};
	private leaveFunctions: { [key: string]: (e: MouseEvent) => void } = {};
	private hoveredObjectIDMap: { [key: string]: boolean } = {};
	private latestPointerEvent: PointerEvent | null = null;

	private clock = new THREE.Clock();
	private resizeCallback?: () => void;

	constructor() {
		const { width, height, aspect } = this.size;

		this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100);

		window.addEventListener("resize", this.handleResize);
		window.addEventListener("pointermove", this.handlePointerMove);
	}

	public getLatestPointerEvent() {
		return this.latestPointerEvent;
	}

	private handlePointerMove = (event: PointerEvent) => {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		const intersects = this.raycaster.intersectObjects(this.scene.children);
		for (const intersect of intersects) {
			if (!this.hoveredObjectIDMap[intersect.object.uuid]) {
				this.hoveredObjectIDMap[intersect.object.uuid] = true;
				this.enterFunctions[intersect.object.uuid]?.(event);
			}
			this.hoverFunctions[intersect.object.uuid]?.(event);
		}
		const intersectedObjectIDs = intersects.map(
			(intersect) => intersect.object.uuid,
		);
		const hoveredObjectIDs = Object.keys(this.hoveredObjectIDMap);
		for (const hoveredObjectID of hoveredObjectIDs) {
			if (!intersectedObjectIDs.includes(hoveredObjectID)) {
				delete this.hoveredObjectIDMap[hoveredObjectID];
				this.leaveFunctions[hoveredObjectID]?.(event);
			}
		}
		this.latestPointerEvent = event;
	};

	public addHoverFunction(uuid: string, func: (e: MouseEvent) => void) {
		this.hoverFunctions[uuid] = func;
	}

	public addEnterFunction(uuid: string, func: (e: MouseEvent) => void) {
		this.enterFunctions[uuid] = func;
	}

	public addLeaveFunction(uuid: string, func: (e: MouseEvent) => void) {
		this.leaveFunctions[uuid] = func;
	}

	private handleResize = () => {
		this.resizeCallback?.();

		const { width, height, aspect } = this.size;
		this.camera.aspect = aspect;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	};

	get size() {
		const { innerWidth: width, innerHeight: height } = window;
		return { width, height, aspect: width / height };
	}

	setup(container: HTMLElement) {
		container.appendChild(this.renderer.domElement);
	}

	setResizeCallback(callback: () => void) {
		this.resizeCallback = callback;
	}

	getMesh<T extends THREE.Material>(name: string) {
		return this.scene.getObjectByName(name) as THREE.Mesh<
			THREE.BufferGeometry,
			T
		>;
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	requestAnimationFrame(callback: () => void) {
		gl.renderer.setAnimationLoop(() => {
			this.time.delta = this.clock.getDelta();
			this.time.elapsed = this.clock.getElapsedTime();
			callback();
		});
	}

	cancelAnimationFrame() {
		gl.renderer.setAnimationLoop(null);
	}

	dispose() {
		this.cancelAnimationFrame();
		gl.scene?.clear();
	}
}

export const gl = new WebGL();
