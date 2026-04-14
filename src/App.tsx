import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun, Maximize2, Minimize2, Loader2, Download, Upload, Box, CheckCircle, ChevronDown, Image as ImageIcon, Sliders, Palette, Lightbulb, Save, Rotate3D, Layers, Type } from 'lucide-react';
import { MockupScene } from './ThreeScene';

const Accordion = ({ title, icon, children, defaultOpen = false }: { title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden mb-3 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-4 py-3.5 flex items-center justify-between text-left focus:outline-none hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 tracking-wide">{title}</h2>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`px-4 transition-all duration-300 ease-in-out ${isOpen ? 'pb-4 opacity-100' : 'max-h-0 opacity-0 pb-0 overflow-hidden'}`}>
        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MockupScene | null>(null);

  const [isDark, setIsDark] = useState(true);
  const [currentModelType, setCurrentModelType] = useState<'can' | 'cartridge'>('can');
  const [currentLayoutMode, setCurrentLayoutMode] = useState<'single' | 'double'>('single');
  
  const [dimDiam, setDimDiam] = useState(65);
  const [dimHeight, setDimHeight] = useState(145);
  const [dimLidheight, setDimLidheight] = useState(45);
  const [dimNozzleWidth, setDimNozzleWidth] = useState(23);
  const [dimNozzleScale, setDimNozzleScale] = useState(1.0);
  const [showLid, setShowLid] = useState(true);
  const [showNozzle, setShowNozzle] = useState(true);
  
  const [colorBody, setColorBody] = useState('#a3a3a3');
  const [colorDome, setColorDome] = useState('#ff3b3b');
  const [colorValve, setColorValve] = useState('#ffffff');
  const [colorLid, setColorLid] = useState('#ffffff');
  const [sliderMetalness, setSliderMetalness] = useState(0.4);
  const [sliderLidGloss, setSliderLidGloss] = useState(0.9);
  const [sliderLidTransparency, setSliderLidTransparency] = useState(0.8);
  const [sliderValveTransparency, setSliderValveTransparency] = useState(0.0);
  const [lightingIntensity, setLightingIntensity] = useState(1.0);
  const [colorSaturation, setColorSaturation] = useState(1.0);
  
  const [decalScale, setDecalScale] = useState(0.95);
  const [decalX, setDecalX] = useState(0.5);
  const [decalY, setDecalY] = useState(0.5);
  
  const [modelRotX, setModelRotX] = useState(0);
  const [modelRotY, setModelRotY] = useState(0);
  const [modelRotZ, setModelRotZ] = useState(0);
  const [modelScale, setModelScale] = useState(1.0);
  const [bgScale, setBgScale] = useState(1.0);
  
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState('Mockup');
  const [uploadText, setUploadText] = useState('PDF / Bild hochladen');
  const [isUploading, setIsUploading] = useState(false);
  
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [isBgVisible, setIsBgVisible] = useState(true);
  const [bgUploadText, setBgUploadText] = useState('Hintergrundbild hochladen');
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [imgFormat, setImgFormat] = useState('png');
  const [imgQuality, setImgQuality] = useState('100');
  const [imgTransparent, setImgTransparent] = useState(true);

  const [activeFullscreenMenu, setActiveFullscreenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const scene = new MockupScene(containerRef.current);
    sceneRef.current = scene;
    
    return () => {
      scene.destroy();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    scene.isDark = isDark;
    scene.currentModelType = currentModelType;
    scene.currentLayoutMode = currentLayoutMode;
    
    scene.bodyMat.color.set(colorBody);
    scene.domeMat.color.set(colorDome);
    scene.valveMat.color.set(colorValve);
    scene.lidMat.color.set(colorLid);
    scene.bodyMat.metalness = sliderMetalness;
    scene.lidMat.roughness = 1.0 - sliderLidGloss;
    scene.lidMat.transmission = sliderLidTransparency;
    scene.lidMat.opacity = 1.0 - (sliderLidTransparency * 0.8); // 1.0 at 0, 0.2 at 1.0
    scene.lidMat.envMapIntensity = 1.5 + (sliderLidTransparency * 1.5); // 1.5 at 0, 3.0 at 1.0
    scene.lidMat.transparent = sliderLidTransparency > 0;
    scene.lidMat.depthWrite = sliderLidTransparency === 0; // Only write depth when opaque
    
    scene.valveMat.transmission = sliderValveTransparency;
    scene.valveMat.opacity = 1.0 - (sliderValveTransparency * 0.8);
    scene.valveMat.envMapIntensity = 1.0 + (sliderValveTransparency * 2.0);
    scene.valveMat.transparent = sliderValveTransparency > 0;
    scene.valveMat.depthWrite = sliderValveTransparency === 0;
    
    scene.uploadedImage = uploadedImage;
    scene.uploadedFilename = uploadedFilename;
    scene.backgroundImage = backgroundImage;
    
    scene.setLightingIntensity(lightingIntensity * 0.5);
    scene.setColorSaturation(colorSaturation);
    
    scene.updateDimensions({
      d_mm: dimDiam,
      h_mm: dimHeight,
      l_mm: dimLidheight,
      nw_mm: dimNozzleWidth,
      showLid,
      showNozzle,
      wrapPercent: decalScale,
      rotX: decalX,
      posY: decalY,
      nozzleScale: dimNozzleScale * 2.7,
      modelRotX,
      modelRotY,
      modelRotZ,
      modelScale
    });
  }, [
    isDark, currentModelType, currentLayoutMode, dimDiam, dimHeight, dimLidheight, dimNozzleWidth, showLid, showNozzle,
    colorBody, colorDome, colorValve, colorLid, sliderMetalness, sliderLidGloss, sliderLidTransparency, sliderValveTransparency, decalScale, decalX, decalY, uploadedImage, uploadedFilename, backgroundImage, dimNozzleScale, lightingIntensity, colorSaturation, modelRotX, modelRotY, modelRotZ, modelScale
  ]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
      setImgQuality('bg');
      setBgUploadText("Bild geladen!");
      setTimeout(() => setBgUploadText("Anderes Bild hochladen"), 2500);
    };
    img.onerror = () => {
      setBgUploadText("Fehler beim Laden");
      setTimeout(() => setBgUploadText("Hintergrundbild hochladen"), 2500);
    };
    img.src = url;
  };

  const handleModelTypeChange = (type: 'can' | 'cartridge') => {
    setCurrentModelType(type);
    if (type === 'can') {
      setDimDiam(65);
      setDimHeight(145);
      setDimLidheight(45);
      setColorBody('#a3a3a3');
      setColorLid('#ffffff');
      setSliderMetalness(0.4);
      setSliderLidGloss(0.9);
      setDimNozzleScale(1.0);
    } else {
      setDimDiam(48);
      setDimHeight(215);
      setDimLidheight(105);
      setDimNozzleWidth(12);
      setColorBody('#ffffff');
      setColorLid('#f8fafc');
      setSliderMetalness(0.0);
      setSliderLidGloss(0.4);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const lastDotIndex = file.name.lastIndexOf('.');
    const filename = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
    setUploadedFilename(filename);
    
    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          try {
            const typedarray = new Uint8Array(this.result as ArrayBuffer);
            const pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib) throw new Error("PDF.js not loaded");
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 4.0 });
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;
            const img = new Image();
            img.onload = () => {
              setUploadedImage(img);
              setUploadText("PDF in HD geladen!");
              setIsUploading(false);
              setTimeout(() => setUploadText("Anderes PDF/Bild hochladen"), 2500);
            };
            img.src = tempCanvas.toDataURL('image/png');
          } catch (err) {
            console.error(err);
            setIsUploading(false);
            setUploadText("Fehler beim Laden");
            setTimeout(() => setUploadText("Anderes PDF/Bild hochladen"), 2500);
          }
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
          setUploadText("Bild geladen!");
          setIsUploading(false);
          setTimeout(() => setUploadText("Anderes PDF/Bild hochladen"), 2500);
        };
        img.onerror = (err) => {
          console.error("Image load error", err);
          setIsUploading(false);
          setUploadText("Fehler beim Laden");
          setTimeout(() => setUploadText("Anderes PDF/Bild hochladen"), 2500);
        };
        img.src = url;
      }
    } catch (error) {
      setIsUploading(false);
      setUploadText("Fehler. Erneut versuchen.");
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = url;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const handleExportGLB = async () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    try {
      const url = await sceneRef.current.exportGLB();
      const filename = `${uploadedFilename}.glb`;
      triggerDownload(url, filename);
    } catch (e) {
      alert("Fehler beim Erstellen der 3D-Datei.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    
    setTimeout(async () => {
      try {
        // If background is hidden, force transparent export
        const exportTransparent = (backgroundImage && isBgVisible) ? imgTransparent : true;
        const dataUrl = await sceneRef.current!.exportImage(imgQuality, imgFormat, exportTransparent);
        
        let suffix = imgQuality === '4k' ? '4K' : (imgQuality === 'bg' ? 'Original' : (imgQuality === '100' ? 'Standard' : 'Kompakt'));
        let bgSuffix = (exportTransparent && imgFormat !== 'jpg') ? 'Transparent' : 'MitHG';
        let layoutSuffix = currentLayoutMode === 'double' ? 'Doppel' : 'Einzeln';
        const filename = `${uploadedFilename}-${layoutSuffix}-${suffix}-${bgSuffix}.${imgFormat}`;
        
        triggerDownload(dataUrl, filename);
      } catch (e) {
        console.error(e);
        alert("Fehler beim Erstellen des Bildes.");
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const activeClasses = "flex-1 py-2 px-3 rounded-md border text-sm font-bold transition-colors bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300";
  const inactiveClasses = "flex-1 py-2 px-3 rounded-md border text-sm font-bold transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700";

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] md:h-[100dvh] w-full relative bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 md:overflow-hidden">
      
      {/* 3D VIEWPORT */}
      <div className={`w-full shrink-0 border-b md:border-b-0 border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 h-[100dvh] w-[100vw]' : 'h-[45vh] sticky top-0 z-20 md:h-full md:flex-1 md:relative md:z-10 bg-slate-50 dark:bg-slate-900'}`}>
        
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded shadow-sm z-20 text-[10px] md:text-xs text-slate-600 dark:text-slate-300 pointer-events-none border border-white/50 dark:border-slate-700/50">
          <span className="font-bold">Kamera:</span> 1-Finger drehen, 2-Finger zoomen/verschieben
        </div>

        <button 
          onClick={() => {
            setIsFullscreen(!isFullscreen);
            setTimeout(() => sceneRef.current?.handleResize(), 50);
          }}
          className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur p-3 md:p-2 rounded-lg shadow-lg z-50 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-600 active:scale-95"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          <span className="text-sm font-bold hidden md:inline">{isFullscreen ? 'Schließen' : 'Vollbild'}</span>
        </button>
        
        {isExporting && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center transition-opacity duration-300">
            <Loader2 className="animate-spin h-10 w-10 text-white mb-4" />
            <p className="text-white font-bold tracking-wide">Bereite Datei vor...</p>
          </div>
        )}

        {backgroundImage && isBgVisible && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <img src={backgroundImage.src} className="w-full h-full object-cover" style={{ transform: `scale(${bgScale})` }} alt="Background" />
          </div>
        )}

        <div ref={containerRef} className={`w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none relative z-10 transition-colors duration-500 ${(backgroundImage && isBgVisible) ? 'bg-transparent' : 'bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900'}`}></div>

        {/* FULLSCREEN CONTROLS */}
        {isFullscreen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-end gap-4 pointer-events-none">
            
            {/* Rotation Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'rotation' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Kippen (Vor / Zurück)</label>
                        <span className="font-medium text-slate-200">{modelRotX}°</span>
                      </div>
                      <input type="range" min="-180" max="180" step="1" value={modelRotX} onChange={e => setModelRotX(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Drehen (Links / Rechts)</label>
                        <span className="font-medium text-slate-200">{modelRotY}°</span>
                      </div>
                      <input type="range" min="-180" max="180" step="1" value={modelRotY} onChange={e => setModelRotY(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Rollen (Seitlich kippen)</label>
                        <span className="font-medium text-slate-200">{modelRotZ}°</span>
                      </div>
                      <input type="range" min="-180" max="180" step="1" value={modelRotZ} onChange={e => setModelRotZ(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'rotation' ? null : 'rotation')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'rotation' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Rotation"
              >
                <Rotate3D size={20} />
              </button>
            </div>

            {/* Decal Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'decal' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Etikett hochladen</label></div>
                      <label className="flex items-center justify-center w-full h-10 px-4 transition-colors border-2 border-dashed rounded-xl cursor-pointer border-slate-600 hover:border-blue-500 hover:bg-slate-800/50">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Upload size={16} />
                          <span className="text-xs font-medium">Bild auswählen</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                    {uploadedImage && (
                      <>
                        <div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Größe (Umfang)</label></div>
                          <input type="range" min="0.1" max="1.5" step="0.01" value={decalScale} onChange={e => setDecalScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Horizontal (Links / Rechts drehen)</label></div>
                          <input type="range" min="0" max="1" step="0.01" value={decalX} onChange={e => setDecalX(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Vertikal (Oben / Unten schieben)</label></div>
                          <input type="range" min="0" max="1" step="0.01" value={decalY} onChange={e => setDecalY(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'decal' ? null : 'decal')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'decal' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Etikett"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            {/* Dimensions Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'dimensions' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Größe (Skalierung)</label>
                        <span className="font-medium text-slate-200">{modelScale.toFixed(2)}x</span>
                      </div>
                      <input type="range" min="0.05" max="3" step="0.01" value={modelScale} onChange={e => setModelScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Breite / Tiefe</label>
                        <span className="font-medium text-slate-200">{dimDiam}</span>
                      </div>
                      <input type="range" min="30" max="100" step="1" value={dimDiam} onChange={e => setDimDiam(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Höhe</label>
                        <span className="font-medium text-slate-200">{dimHeight}</span>
                      </div>
                      <input type="range" min="50" max="300" step="1" value={dimHeight} onChange={e => setDimHeight(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'dimensions' ? null : 'dimensions')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'dimensions' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Abmessungen"
              >
                <Box size={20} />
              </button>
            </div>

            {/* Colors Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'colors' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Flaschenfarbe</label></div>
                      <div className="flex items-center gap-3">
                        <input type="color" value={colorBody} onChange={e => setColorBody(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                        <span className="text-xs font-mono text-slate-300 uppercase">{colorBody}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Deckelfarbe</label></div>
                      <div className="flex items-center gap-3">
                        <input type="color" value={colorLid} onChange={e => setColorLid(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                        <span className="text-xs font-mono text-slate-300 uppercase">{colorLid}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Rauheit (Deckel)</label>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value={sliderLidGloss} onChange={e => setSliderLidGloss(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Metallisch (Flasche)</label>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value={sliderMetalness} onChange={e => setSliderMetalness(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'colors' ? null : 'colors')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'colors' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Farben & Finish"
              >
                <Palette size={20} />
              </button>
            </div>

            {/* Lighting Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'lighting' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Helligkeit</label>
                        <span className="font-medium text-slate-200">{Math.round(lightingIntensity * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="2" step="0.1" value={lightingIntensity} onChange={e => setLightingIntensity(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                        <label>Farbsättigung</label>
                        <span className="font-medium text-slate-200">{Math.round(colorSaturation * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="2" step="0.1" value={colorSaturation} onChange={e => setColorSaturation(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'lighting' ? null : 'lighting')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'lighting' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Beleuchtung"
              >
                <Lightbulb size={20} />
              </button>
            </div>

            {/* Background Menu */}
            <div className="relative pointer-events-auto">
              {activeFullscreenMenu === 'background' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5"><label>Hintergrundbild</label></div>
                      <label className="flex items-center justify-center w-full h-10 px-4 transition-colors border-2 border-dashed rounded-xl cursor-pointer border-slate-600 hover:border-blue-500 hover:bg-slate-800/50">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Upload size={16} />
                          <span className="text-xs font-medium">Bild auswählen</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                      </label>
                      {backgroundImage && (
                        <button onClick={() => setBackgroundImage(null)} className="mt-2 w-full py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                          Hintergrund entfernen
                        </button>
                      )}
                    </div>
                    {backgroundImage && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-300">Hintergrund anzeigen</label>
                          <input type="checkbox" checked={isBgVisible} onChange={e => setIsBgVisible(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1.5">
                            <label>Hintergrund Größe</label>
                            <span className="font-medium text-slate-200">{bgScale.toFixed(2)}x</span>
                          </div>
                          <input type="range" min="0.1" max="10" step="0.1" value={bgScale} onChange={e => setBgScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <button onClick={() => {
                          setBackgroundImage(null);
                          setIsBgVisible(true);
                        }} className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                          Hintergrund entfernen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button 
                onClick={() => setActiveFullscreenMenu(activeFullscreenMenu === 'background' ? null : 'background')}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${activeFullscreenMenu === 'background' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'}`}
                title="Hintergrund"
              >
                <Layers size={20} />
              </button>
            </div>

            {/* Capture Button */}
            <div className="pointer-events-auto">
              <button 
                onClick={() => {
                  setActiveFullscreenMenu(null);
                  handleExportImage();
                }}
                className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform active:scale-90"
                title="Bild aufnehmen"
              >
                <Download size={24} />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* SIDEBAR UI */}
      <div className={`w-full md:w-[400px] flex flex-col z-0 order-last md:order-first bg-slate-50 dark:bg-slate-900 md:border-r border-slate-200 dark:border-slate-800 shadow-2xl md:h-full md:overflow-hidden ${isFullscreen ? 'hidden' : ''}`}>
          
          <div className="p-4 bg-slate-900 dark:bg-black text-white shrink-0 flex justify-between items-center z-10 shadow-md">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Box size={20} />
                MockupMagic
              </h1>
            </div>
            
            <button onClick={() => setIsDark(!isDark)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700" title="Nachtmodus umschalten">
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-300" />}
            </button>
          </div>

          <div className="p-4 flex-1 space-y-2 pb-8 md:overflow-y-auto md:min-h-0"> 
            
            <Accordion title="Dein Etikett (Design)" icon={<ImageIcon size={16} />} defaultOpen={true}>
              <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl cursor-pointer bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-100/50 dark:hover:bg-slate-700/50 transition-colors mb-4 relative overflow-hidden group shadow-sm">
                {isUploading && (
                  <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 flex items-center justify-center transition-opacity z-10">
                    <span className="text-white font-bold text-sm animate-pulse">Wird verarbeitet...</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-semibold">{uploadText}</span>
                </div>
                <input type="file" className="hidden" accept=".pdf, .png, .jpg, .jpeg, application/pdf, image/*" onChange={handleFileUpload} />
              </label>

              <div className={`space-y-5 transition-opacity ${!uploadedImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => { setDecalScale(1.0); setDecalX(0.5); setDecalY(0.5); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors active:scale-95">
                  Auf Objekt zentrieren
                </button>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"><label>Größe (Umfang)</label></div>
                    <input type="range" min="0.1" max="1.5" step="0.01" value={decalScale} onChange={e => setDecalScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"><label>Horizontal (Links / Rechts drehen)</label></div>
                    <input type="range" min="0" max="1" step="0.01" value={decalX} onChange={e => setDecalX(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"><label>Vertikal (Oben / Unten schieben)</label></div>
                    <input type="range" min="0" max="1" step="0.01" value={decalY} onChange={e => setDecalY(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion title="Hintergrund (Szene)" icon={<ImageIcon size={16} />}>
              <label className="flex flex-col items-center justify-center w-full h-14 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-2 relative overflow-hidden group shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <Upload size={16} className="text-slate-500 dark:text-slate-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{bgUploadText}</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
              </label>
              {backgroundImage && (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Hintergrund anzeigen</label>
                    <input type="checkbox" checked={isBgVisible} onChange={e => setIsBgVisible(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <label>Hintergrund Größe</label>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{bgScale.toFixed(2)}x</span>
                    </div>
                    <input type="range" min="0.1" max="10" step="0.1" value={bgScale} onChange={e => setBgScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                  <button onClick={() => {
                    setBackgroundImage(null);
                    setIsBgVisible(true);
                    if (imgQuality === 'bg') setImgQuality('4k');
                  }} className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold rounded-xl transition-colors border border-red-200 dark:border-red-800/50">
                    Hintergrund entfernen
                  </button>
                </div>
              )}
            </Accordion>

            <Accordion title="Produkt & Layout" icon={<Layers size={16} />}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Produkt wählen</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleModelTypeChange('can')} className={currentModelType === 'can' ? activeClasses : inactiveClasses}>Sprühdose</button>
                    <button onClick={() => handleModelTypeChange('cartridge')} className={currentModelType === 'cartridge' ? activeClasses : inactiveClasses}>Silikonkartusche</button>
                  </div>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Darstellung (Layout)</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentLayoutMode('single')} className={currentLayoutMode === 'single' ? activeClasses : inactiveClasses}>Einzeln</button>
                    <button onClick={() => setCurrentLayoutMode('double')} className={currentLayoutMode === 'double' ? activeClasses : inactiveClasses}>Doppel</button>
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion title="Ausrichtung (Rotation)" icon={<Rotate3D size={16} />}>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Kippen (Vor / Zurück)</label>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{modelRotX}°</span>
                  </div>
                  <input type="range" min="-180" max="180" step="1" value={modelRotX} onChange={e => setModelRotX(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Drehen (Links / Rechts)</label>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{modelRotY}°</span>
                  </div>
                  <input type="range" min="-180" max="180" step="1" value={modelRotY} onChange={e => setModelRotY(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Rollen (Seitlich kippen)</label>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{modelRotZ}°</span>
                  </div>
                  <input type="range" min="-180" max="180" step="1" value={modelRotZ} onChange={e => setModelRotZ(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <button onClick={() => { setModelRotX(0); setModelRotY(0); setModelRotZ(0); }} className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors">
                  Rotation zurücksetzen
                </button>
              </div>
            </Accordion>

            <Accordion title="Abmessungen" icon={<Sliders size={16} />}>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Größe (Skalierung)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{modelScale.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.05" max="3" step="0.01" value={modelScale} onChange={e => setModelScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Durchmesser (Breite)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dimDiam} mm</span>
                  </div>
                  <input type="range" min="30" max="90" step="1" value={dimDiam} onChange={e => setDimDiam(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Höhe (Hauptkörper)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dimHeight} mm</span> 
                  </div>
                  <input type="range" min="50" max="300" step="1" value={dimHeight} onChange={e => setDimHeight(parseInt(e.target.value))} className="w-full accent-blue-500" /> 
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Deckel anzeigen</label>
                    <input type="checkbox" checked={showLid} onChange={e => setShowLid(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Düse anzeigen</label>
                    <input type="checkbox" checked={showNozzle} onChange={e => setShowNozzle(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Aufsatzhöhe (Deckel/Düse)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dimLidheight} mm</span>
                  </div>
                  <input type="range" min="10" max="150" step="1" value={dimLidheight} onChange={e => setDimLidheight(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>

                {currentModelType === 'cartridge' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <label>Düsenbreite & Gewinde</label>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{dimNozzleWidth} mm</span>
                    </div>
                    <input type="range" min="10" max="50" step="1" value={dimNozzleWidth} onChange={e => setDimNozzleWidth(parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                )}
                
                {currentModelType === 'can' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <label>Düsengröße (Skalierung)</label>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(dimNozzleScale * 100)}%</span>
                    </div>
                    <input type="range" min="0.2" max="3.0" step="0.05" value={dimNozzleScale} onChange={e => setDimNozzleScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                )}
              </div>
            </Accordion>

            <Accordion title="Farben & Finish" icon={<Palette size={16} />}>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Körperfarbe</label>
                  <input type="color" value={colorBody} onChange={e => setColorBody(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Aufsatzfarbe</label>
                  <input type="color" value={colorLid} onChange={e => setColorLid(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
                </div>
                {currentModelType === 'can' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Kuppelfarbe</label>
                      <input type="color" value={colorDome} onChange={e => setColorDome(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Düsenfarbe</label>
                      <input type="color" value={colorValve} onChange={e => setColorValve(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Körper-Material (Plastik &rarr; Chrom)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderMetalness} onChange={e => setSliderMetalness(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Aufsatz-Glanz (Matt &rarr; Lack)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderLidGloss} onChange={e => setSliderLidGloss(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Aufsatz-Transparenz (Massiv &rarr; Glas)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderLidTransparency} onChange={e => setSliderLidTransparency(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
                {currentModelType === 'can' && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <label>Düsen-Transparenz (Massiv &rarr; Glas)</label>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={sliderValveTransparency} onChange={e => setSliderValveTransparency(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                )}
              </div>
            </Accordion>

            <Accordion title="Beleuchtung & Sättigung" icon={<Lightbulb size={16} />}>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Beleuchtung (Dunkel &rarr; Hell)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(lightingIntensity * 100)}%</span>
                  </div>
                  <input type="range" min="0.2" max="2.0" step="0.05" value={lightingIntensity} onChange={e => setLightingIntensity(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <label>Farbsättigung (Grau &rarr; Bunt)</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(colorSaturation * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="2.0" step="0.05" value={colorSaturation} onChange={e => setColorSaturation(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                </div>
              </div>
            </Accordion>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button onClick={handleExportGLB} className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95">
              <Download size={18} />
              Als 3D-Modell (.glb) speichern
            </button>
            
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Format:</span>
                <select value={imgFormat} onChange={e => setImgFormat(e.target.value)} className="text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-white px-2 py-1 outline-none shadow-sm cursor-pointer">
                  <option value="png">PNG (Beste für Web)</option>
                  <option value="jpg">JPG (Kleine Datei)</option>
                  <option value="svg">SVG (Vektor/Print)</option>
                  <option value="pdf">PDF (Dokument)</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Qualität:</span>
                <select value={imgQuality} onChange={e => setImgQuality(e.target.value)} className="text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-white px-2 py-1 outline-none shadow-sm cursor-pointer">
                  {backgroundImage && <option value="bg">Original (Hintergrund-Auflösung)</option>}
                  <option value="4k">4K (Ultra HD)</option>
                  <option value="100">Standard (Ansicht)</option>
                  <option value="50">Kompakt (ca. 1/2 Größe)</option>
                </select>
              </div>
              <div className={`flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 ${(imgFormat === 'jpg' || (backgroundImage && isBgVisible)) ? 'opacity-50' : ''}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hintergrund:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={(imgFormat === 'jpg' || (backgroundImage && isBgVisible)) ? false : imgTransparent} disabled={imgFormat === 'jpg' || (backgroundImage && isBgVisible)} onChange={e => setImgTransparent(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Transparent</span>
                </label>
              </div>
              <button onClick={handleExportImage} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow-sm flex justify-center items-center gap-2 transition-transform active:scale-95 text-sm">
                <Download size={16} />
                Als 2D-Bild speichern
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

