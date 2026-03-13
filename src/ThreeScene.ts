import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFExporter } from 'three-stdlib';

export class MockupScene {
    container: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    
    bodyMat: THREE.MeshStandardMaterial;
    lidMat: THREE.MeshPhysicalMaterial;
    labelMat: THREE.MeshStandardMaterial;
    
    uvCanvas: HTMLCanvasElement;
    uvCtx: CanvasRenderingContext2D;
    canvasTexture: THREE.CanvasTexture;
    
    masterGroup: THREE.Group;
    can1: THREE.Group;
    can2: THREE.Group;
    cart1: THREE.Group;
    cart2: THREE.Group;
    
    currentModelType: 'can' | 'cartridge' = 'can';
    currentLayoutMode: 'single' | 'double' = 'single';
    
    uploadedImage: HTMLImageElement | null = null;
    uploadedFilename: string = 'Mockup';
    
    isDark: boolean = true;
    
    animationFrameId: number | null = null;
    
    resizeObserver: ResizeObserver;
    
    constructor(container: HTMLElement) {
        this.container = container;
        
        this.scene = new THREE.Scene();
        this.scene.background = null;
        
        this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 0, 35);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.62; // Reduced by 10% from 1.8
        
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        
        container.appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 0, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.35); // Reduced by 10% from 1.5
        this.scene.add(ambientLight);
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.16); // Reduced by 10% from 2.4
        mainLight.position.set(10, 20, 15);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.35); // Reduced by 10% from 1.5
        fillLight.position.set(-15, 5, -10);
        this.scene.add(fillLight);
        
        this.bodyMat = new THREE.MeshStandardMaterial({ color: 0xa3a3a3, metalness: 0.4, roughness: 0.25, side: THREE.DoubleSide });
        this.lidMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x000000, 
            metalness: 0.1, 
            roughness: 0.4, 
            side: THREE.DoubleSide,
            transmission: 0, // Default opaque
            ior: 1.5, // Index of refraction for plastic
            thickness: 2.0, // Thickness of the plastic
            transparent: true
        });
        
        this.uvCanvas = document.createElement('canvas');
        this.uvCanvas.width = 4096;
        this.uvCanvas.height = 4096;
        this.uvCtx = this.uvCanvas.getContext('2d')!;
        this.uvCtx.fillStyle = 'rgba(255, 255, 255, 0)';
        this.uvCtx.clearRect(0, 0, this.uvCanvas.width, this.uvCanvas.height);
        
        this.canvasTexture = new THREE.CanvasTexture(this.uvCanvas);
        this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
        this.canvasTexture.flipY = false;
        
        this.labelMat = new THREE.MeshStandardMaterial({
            map: this.canvasTexture,
            transparent: true,
            alphaTest: 0.05,
            metalness: 0.0, // Reduced from 0.1 to avoid graying out whites
            roughness: 0.6, // Increased to make it more matte and reflect less environment
            side: THREE.FrontSide
        });
        
        this.masterGroup = new THREE.Group();
        this.scene.add(this.masterGroup);
        
        this.can1 = this.createCanGroup();
        this.can2 = this.createCanGroup();
        this.cart1 = this.createCartGroup();
        this.cart2 = this.createCartGroup();
        
        this.masterGroup.add(this.can1, this.can2, this.cart1, this.cart2);
        
        this.animate = this.animate.bind(this);
        this.animate();
        
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.container);
    }
    
    createCanGroup() {
        const geoCylinder = new THREE.CylinderGeometry(1, 1, 1, 64);
        const geoCylinderOpen = new THREE.CylinderGeometry(1, 1, 1, 64, 1, true);
        const geoTorus = new THREE.TorusGeometry(1, 0.05, 16, 64);
        const geoDome = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI*2, 0, Math.PI/2);
        
        const group = new THREE.Group();
        const meshBody = new THREE.Mesh(geoCylinder, this.bodyMat); meshBody.name = "body";
        const meshLabel = new THREE.Mesh(geoCylinderOpen, this.labelMat); meshLabel.name = "label"; meshLabel.visible = false;
        const meshRimBottom = new THREE.Mesh(geoTorus, this.bodyMat); meshRimBottom.name = "rimBottom"; meshRimBottom.rotation.x = Math.PI / 2;
        const meshRimTop = new THREE.Mesh(geoTorus, this.bodyMat); meshRimTop.name = "rimTop"; meshRimTop.rotation.x = Math.PI / 2;
        const meshDome = new THREE.Mesh(geoDome, this.bodyMat); meshDome.name = "dome"; meshDome.scale.y = 0.4;
        const meshValve = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 32), this.bodyMat); meshValve.name = "valve";
        const meshLid = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64), this.lidMat); meshLid.name = "lid";
        group.add(meshBody, meshLabel, meshRimBottom, meshRimTop, meshDome, meshValve, meshLid);
        return group;
    }
    
    createCartGroup() {
        const geoCylinder = new THREE.CylinderGeometry(1, 1, 1, 64);
        const geoCylinderOpen = new THREE.CylinderGeometry(1, 1, 1, 64, 1, true);
        
        const group = new THREE.Group();
        
        const meshCartBody = new THREE.Mesh(geoCylinderOpen, this.bodyMat); meshCartBody.name = "body";
        const meshCartLabel = new THREE.Mesh(geoCylinderOpen, this.labelMat); meshCartLabel.name = "label"; meshCartLabel.visible = false;
        
        const meshCartInnerWall = new THREE.Mesh(geoCylinderOpen, this.bodyMat); meshCartInnerWall.name = "innerWall";
        const meshCartBottomCap = new THREE.Mesh(geoCylinder, this.bodyMat); meshCartBottomCap.name = "bottomCap";
        
        const meshCartTopLip = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64), this.bodyMat); meshCartTopLip.name = "topLip";
        const meshCartTopFlat = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1, 64), this.bodyMat); meshCartTopFlat.name = "topFlat";
        const meshCartCenterDome = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.95, 1, 32), this.bodyMat); meshCartCenterDome.name = "centerDome";
        
        const meshThreadBase = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), this.bodyMat); meshThreadBase.name = "threadBase";
        
        const tGeo = new THREE.TorusGeometry(1, 0.05, 12, 32);
        const tr1 = new THREE.Mesh(tGeo, this.bodyMat); tr1.name = "threadR1"; tr1.rotation.x = Math.PI/2;
        const tr2 = new THREE.Mesh(tGeo, this.bodyMat); tr2.name = "threadR2"; tr2.rotation.x = Math.PI/2;
        const tr3 = new THREE.Mesh(tGeo, this.bodyMat); tr3.name = "threadR3"; tr3.rotation.x = Math.PI/2;
        const tr4 = new THREE.Mesh(tGeo, this.bodyMat); tr4.name = "threadR4"; tr4.rotation.x = Math.PI/2;
        const tr5 = new THREE.Mesh(tGeo, this.bodyMat); tr5.name = "threadR5"; tr5.rotation.x = Math.PI/2;
        
        const meshNipple = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1, 1, 32), this.bodyMat); meshNipple.name = "nipple";
        
        const nozzleGroup = new THREE.Group(); nozzleGroup.name = "nozzleGroup";
        
        const ringGeo = new THREE.TorusGeometry(1, 0.15, 16, 32);
        const meshRing = new THREE.Mesh(ringGeo, this.lidMat); meshRing.name = "ring"; meshRing.rotation.x = Math.PI / 2;
        
        const strapGeo = new THREE.BoxGeometry(1, 1, 1);
        const meshStrap = new THREE.Mesh(strapGeo, this.lidMat); meshStrap.name = "strap";
        
        const collarGeo = new THREE.CylinderGeometry(1, 1, 1, 32, 1, true);
        const meshCollar = new THREE.Mesh(collarGeo, this.lidMat); meshCollar.name = "collar";
        
        const collarRimGeo = new THREE.RingGeometry(1 / 1.35, 1, 32);
        const meshCollarRim = new THREE.Mesh(collarRimGeo, this.lidMat); meshCollarRim.name = "collarRim";
        meshCollarRim.rotation.x = Math.PI / 2;
        
        const ribbedBase = new THREE.Group(); ribbedBase.name = "ribbedBase";
        const baseCore = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), this.lidMat);
        ribbedBase.add(baseCore);
        
        for(let i=0; i<8; i++) {
            const ribPivot = new THREE.Group();
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 0.25), this.lidMat);
            rib.position.x = 1;
            ribPivot.add(rib);
            ribPivot.rotation.y = (Math.PI / 4) * i;
            ribbedBase.add(ribPivot);
        }
        
        const tipGeo = new THREE.CylinderGeometry(1, 0.25, 1, 32, 1, true);
        const meshTip = new THREE.Mesh(tipGeo, this.lidMat); meshTip.name = "tip";
        
        nozzleGroup.add(meshRing, meshStrap, meshCollar, meshCollarRim, ribbedBase, meshTip);
        
        const meshCartRim = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 64), this.bodyMat);
        meshCartRim.name = "rim";
        meshCartRim.rotation.x = Math.PI / 2;
        
        group.add(meshCartBody, meshCartLabel, meshCartInnerWall, meshCartBottomCap, meshCartTopLip, meshCartTopFlat, meshCartCenterDome, meshThreadBase, tr1, tr2, tr3, tr4, tr5, meshNipple, nozzleGroup, meshCartRim);
        return group;
    }
    
    applyCanDims(group: THREE.Group, r: number, h: number, l: number, showLid: boolean) {
        group.getObjectByName("body")!.scale.set(r, h, r); group.getObjectByName("body")!.position.y = h / 2;
        group.getObjectByName("label")!.scale.set(r * 1.005, h, r * 1.005); group.getObjectByName("label")!.position.y = h / 2;
        group.getObjectByName("rimBottom")!.scale.set(r, r, r); group.getObjectByName("rimBottom")!.position.y = 0;
        group.getObjectByName("rimTop")!.scale.set(r, r, r); group.getObjectByName("rimTop")!.position.y = h;
        group.getObjectByName("dome")!.scale.set(r * 0.95, r * 0.4, r * 0.95); group.getObjectByName("dome")!.position.y = h;
        group.getObjectByName("valve")!.position.y = h + (r*0.4);
        group.getObjectByName("lid")!.scale.set(r, l, r); group.getObjectByName("lid")!.position.y = h + (l / 2);
        group.getObjectByName("lid")!.visible = showLid;
    }
    
    applyCartDims(group: THREE.Group, r: number, h: number, l: number, showNozzle: boolean, nw: number) {
        group.getObjectByName("body")!.scale.set(r, h, r); group.getObjectByName("body")!.position.y = h / 2;
        group.getObjectByName("label")!.scale.set(r * 1.005, h, r * 1.005); group.getObjectByName("label")!.position.y = h / 2;
        
        const hollowDepth = 2.0;
        const wallThickness = 0.1;
        const innerR = r - wallThickness;

        const innerWall = group.getObjectByName("innerWall")!;
        innerWall.scale.set(innerR, hollowDepth, innerR);
        innerWall.position.y = hollowDepth / 2;

        const bottomCap = group.getObjectByName("bottomCap")!;
        bottomCap.scale.set(innerR, 0.05, innerR);
        bottomCap.position.y = hollowDepth;

        const rim = group.getObjectByName("rim") as THREE.Mesh;
        if(rim.geometry) rim.geometry.dispose();
        rim.geometry = new THREE.RingGeometry(innerR, r, 64);
        rim.scale.set(1, 1, 1);
        rim.position.y = 0;
        
        let curY = h;
        
        const lipH = 0.15;
        group.getObjectByName("topLip")!.scale.set(r*1.01, lipH, r*1.01); group.getObjectByName("topLip")!.position.y = curY + (lipH / 2);

        const flatH = 0.05;
        group.getObjectByName("topFlat")!.scale.set(r*0.96, flatH, r*0.96); group.getObjectByName("topFlat")!.position.y = curY + lipH - (flatH / 2);
        
        curY += lipH;

        const threadR = nw / 2;

        const domeH = r * 0.15;
        const centerDome = group.getObjectByName("centerDome") as THREE.Mesh;
        if(centerDome.geometry) centerDome.geometry.dispose();
        centerDome.geometry = new THREE.CylinderGeometry(Math.max(threadR * 1.05, 0.1), r * 0.95, domeH, 32);
        centerDome.scale.set(1, 1, 1);
        centerDome.position.y = curY + (domeH / 2);

        curY += domeH;
        
        const threadH = r * 0.22;
        group.getObjectByName("threadBase")!.scale.set(threadR, threadH, threadR); group.getObjectByName("threadBase")!.position.y = curY + (threadH / 2);
        
        const trScale = threadR * 1.05;
        group.getObjectByName("threadR1")!.scale.set(trScale, trScale, trScale); group.getObjectByName("threadR1")!.position.y = curY + threadH * 0.15;
        group.getObjectByName("threadR2")!.scale.set(trScale, trScale, trScale); group.getObjectByName("threadR2")!.position.y = curY + threadH * 0.32;
        group.getObjectByName("threadR3")!.scale.set(trScale, trScale, trScale); group.getObjectByName("threadR3")!.position.y = curY + threadH * 0.50;
        group.getObjectByName("threadR4")!.scale.set(trScale, trScale, trScale); group.getObjectByName("threadR4")!.position.y = curY + threadH * 0.68;
        group.getObjectByName("threadR5")!.scale.set(trScale, trScale, trScale); group.getObjectByName("threadR5")!.position.y = curY + threadH * 0.85;

        curY += threadH;
        const nippleH = r * 0.2;
        group.getObjectByName("nipple")!.scale.set(threadR * 0.85, nippleH, threadR * 0.85); group.getObjectByName("nipple")!.position.y = curY + (nippleH / 2);

        const nozzleGroup = group.getObjectByName("nozzleGroup")!;
        const ringY = h + lipH + domeH + (threadH * 0.1);
        nozzleGroup.position.set(0, ringY, 0);
        
        const ringR = threadR * 1.15;
        group.getObjectByName("ring")!.scale.set(ringR, ringR, ringR * 0.4);

        const baseR = threadR * 1.35;
        const collarR = baseR * 1.35;

        const nozzleDist = r + collarR + 0.15;

        const strapL = nozzleDist - baseR;
        const strapW = Math.max(threadR * 1.8, 0.35);
        const strapT = 0.06;
        const strap = group.getObjectByName("strap")!;
        strap.scale.set(strapL, strapT, strapW);
        strap.position.set(-strapL / 2, 0, 0);

        const collarH = r * 0.12;
        const collar = group.getObjectByName("collar")!;
        collar.scale.set(collarR, collarH, collarR);
        collar.position.set(-nozzleDist, 0, 0);
        
        const collarRim = group.getObjectByName("collarRim")!;
        collarRim.scale.set(collarR, collarR, collarR);
        collarRim.position.set(-nozzleDist, -collarH / 2, 0);

        const baseH = l * 0.25;
        const ribbedBase = group.getObjectByName("ribbedBase")!;
        ribbedBase.scale.set(baseR, baseH, baseR);
        ribbedBase.position.set(-nozzleDist, -collarH/2 - baseH/2, 0);

        const tipH = l * 0.75;
        const tip = group.getObjectByName("tip")!;
        tip.scale.set(baseR, tipH, baseR);
        tip.position.set(-nozzleDist, -collarH/2 - baseH - tipH/2, 0);

        nozzleGroup.visible = showNozzle;
    }
    
    updateDimensions(params: any) {
        const { d_mm, h_mm, l_mm, nw_mm, showLid, wrapPercent, rotX, posY } = params;
        
        const r = (d_mm / 2) / 10;
        const h = h_mm / 10;
        const l = l_mm / 10;
        const nw = nw_mm / 10;

        this.can1.visible = false; this.can2.visible = false;
        this.cart1.visible = false; this.cart2.visible = false;

        let activeObj1, activeObj2, totalHeight;

        if (this.currentModelType === 'can') {
            activeObj1 = this.can1; activeObj2 = this.can2;
            this.applyCanDims(this.can1, r, h, l, showLid);
            this.applyCanDims(this.can2, r, h, l, showLid);
            totalHeight = h + (showLid ? l : 0);
        } else {
            activeObj1 = this.cart1; activeObj2 = this.cart2;
            this.applyCartDims(this.cart1, r, h, l, showLid, nw);
            this.applyCartDims(this.cart2, r, h, l, showLid, nw);
            totalHeight = h + 0.15 + (r*0.15) + (r*0.22) + (r*0.2);
        }

        activeObj1.visible = true;

        if (this.currentLayoutMode === 'single') {
            activeObj1.position.set(0, -totalHeight / 2, 0);
            activeObj1.rotation.set(0, 0, 0);
            this.controls.target.set(0, 0, 0);
        } else {
            activeObj2.visible = true;
            
            const offsetX = -totalHeight * 0.12;
            
            activeObj1.position.set(r * 1.2 + offsetX, -totalHeight / 2, r * 1.5);
            activeObj1.rotation.set(0, -Math.PI / 24, 0);

            const lieX = (r * 1.0 - totalHeight / 2) + offsetX;
            activeObj2.position.set(lieX, -totalHeight / 2 + r, -r * 2.0);
            
            if (this.currentModelType === 'cartridge') {
                activeObj2.rotation.set(Math.PI / 5, Math.PI * 0.9, Math.PI / 2);
            } else {
                activeObj2.rotation.set(Math.PI / 5, 0, Math.PI / 2);
            }
            
            this.controls.target.set(0, 0, 0);
        }

        if(this.uploadedImage) {
            this.updateTexture(d_mm, h_mm, wrapPercent, rotX, posY);
            this.can1.getObjectByName("label")!.visible = true;
            this.can2.getObjectByName("label")!.visible = true;
            this.cart1.getObjectByName("label")!.visible = true;
            this.cart2.getObjectByName("label")!.visible = true;
        } else {
            this.can1.getObjectByName("label")!.visible = false;
            this.can2.getObjectByName("label")!.visible = false;
            this.cart1.getObjectByName("label")!.visible = false;
            this.cart2.getObjectByName("label")!.visible = false;
        }
    }
    
    updateTexture(d_mm: number, h_mm: number, wrapPercent: number, rotX: number, posY: number) {
        if (!this.uploadedImage) return;
        
        const physCircumference = Math.PI * d_mm;
        const physHeight = h_mm;
        const cw = this.uvCanvas.width;
        const ch = this.uvCanvas.height;
        this.uvCtx.clearRect(0, 0, cw, ch);

        const imgAspect = this.uploadedImage.width / this.uploadedImage.height;
        const targetPhysWidth = physCircumference * wrapPercent;
        const targetPhysHeight = targetPhysWidth / imgAspect;

        const drawW = (targetPhysWidth / physCircumference) * cw;
        const drawH = (targetPhysHeight / physHeight) * ch;
        const centerX = rotX * cw;
        const centerY = posY * ch;
        const startX = centerX - (drawW / 2);
        const startY = centerY - (drawH / 2);

        this.uvCtx.save();
        this.uvCtx.translate(0, ch);
        this.uvCtx.scale(1, -1);
        this.uvCtx.drawImage(this.uploadedImage, startX, startY, drawW, drawH);
        if (startX < 0) this.uvCtx.drawImage(this.uploadedImage, startX + cw, startY, drawW, drawH);
        if (startX + drawW > cw) this.uvCtx.drawImage(this.uploadedImage, startX - cw, startY, drawW, drawH);
        this.uvCtx.restore();
        this.canvasTexture.needsUpdate = true;
    }
    
    handleResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.resizeObserver.disconnect();
        this.renderer.dispose();
        this.container.innerHTML = '';
    }
    
    async exportGLB(): Promise<string> {
        return new Promise((resolve, reject) => {
            const exporter = new GLTFExporter();
            exporter.parse(this.masterGroup, (gltf) => {
                const isGLB = gltf instanceof ArrayBuffer;
                const blob = isGLB ? 
                    new Blob([gltf], { type: 'model/gltf-binary' }) : 
                    new Blob([JSON.stringify(gltf)], { type: 'text/plain' });
                const objectUrl = URL.createObjectURL(blob);
                resolve(objectUrl);
            }, (error) => {
                reject(error);
            }, { binary: true });
        });
    }
    
    exportImage(qualityMode: string, format: string, isTransparent: boolean): string {
        const currentW = this.container.clientWidth;
        const currentH = this.container.clientHeight;
        const aspect = currentW / currentH;
        const oldPixelRatio = this.renderer.getPixelRatio();
        const oldBackground = this.scene.background;
        
        let hiResW, hiResH, tempPixelRatio;
        
        if (qualityMode === '4k') {
            hiResW = 4096;
            hiResH = Math.round(hiResW / aspect);
            tempPixelRatio = 1;
        } else if (qualityMode === '100') {
            hiResW = currentW;
            hiResH = currentH;
            tempPixelRatio = oldPixelRatio;
        } else {
            hiResW = Math.max(1, Math.round(currentW * 0.75));
            hiResH = Math.max(1, Math.round(currentH * 0.75));
            tempPixelRatio = 1;
        }
        
        if (format === 'jpg') {
            this.scene.background = isTransparent ? new THREE.Color('#ffffff') : new THREE.Color(this.isDark ? '#0f172a' : '#f1f5f9');
        } else {
            this.scene.background = isTransparent ? null : new THREE.Color(this.isDark ? '#0f172a' : '#f1f5f9');
        }
        
        this.renderer.setPixelRatio(tempPixelRatio);
        this.renderer.setSize(hiResW, hiResH, false);
        this.renderer.render(this.scene, this.camera);
        
        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;
        
        let dataUrl = '';
        if (format === 'svg') {
            const pngData = this.renderer.domElement.toDataURL('image/png', 1.0);
            const svgContent = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
                    <image href="${pngData}" width="${width}" height="${height}" />
                </svg>
            `;
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            dataUrl = URL.createObjectURL(blob);
        } else if (format === 'pdf') {
            const { jsPDF } = (window as any).jspdf;
            const orientation = width > height ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'pt', [width, height]);
            const pngData = this.renderer.domElement.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', 1.0);
            pdf.addImage(pngData, isTransparent ? 'PNG' : 'JPEG', 0, 0, width, height);
            const blob = pdf.output('blob');
            dataUrl = URL.createObjectURL(blob);
        } else if (format === 'jpg') {
            dataUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.95);
        } else {
            dataUrl = this.renderer.domElement.toDataURL('image/png', 1.0);
        }

        this.scene.background = oldBackground;
        this.renderer.setPixelRatio(oldPixelRatio);
        this.renderer.setSize(currentW, currentH);
        this.renderer.render(this.scene, this.camera);
        
        return dataUrl;
    }
}
