import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun, Maximize2, Minimize2, Loader2, Download, Upload, Box, CheckCircle } from 'lucide-react';
import { MockupScene } from './ThreeScene';

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
  const [showLid, setShowLid] = useState(true);
  
  const [colorBody, setColorBody] = useState('#a3a3a3');
  const [colorLid, setColorLid] = useState('#000000');
  const [sliderMetalness, setSliderMetalness] = useState(0.4);
  const [sliderLidGloss, setSliderLidGloss] = useState(0.6);
  const [sliderLidTransparency, setSliderLidTransparency] = useState(0);
  
  const [decalScale, setDecalScale] = useState(0.95);
  const [decalX, setDecalX] = useState(0.5);
  const [decalY, setDecalY] = useState(0.5);
  
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState('Mockup');
  const [uploadText, setUploadText] = useState('PDF / Bild hochladen');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  
  const [imgFormat, setImgFormat] = useState('png');
  const [imgQuality, setImgQuality] = useState('100');
  const [imgTransparent, setImgTransparent] = useState(true);

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
    scene.lidMat.color.set(colorLid);
    scene.bodyMat.metalness = sliderMetalness;
    scene.lidMat.roughness = 1.0 - sliderLidGloss;
    scene.lidMat.transmission = sliderLidTransparency;
    scene.lidMat.transparent = sliderLidTransparency > 0;
    
    scene.uploadedImage = uploadedImage;
    scene.uploadedFilename = uploadedFilename;
    
    scene.updateDimensions({
      d_mm: dimDiam,
      h_mm: dimHeight,
      l_mm: dimLidheight,
      nw_mm: dimNozzleWidth,
      showLid,
      wrapPercent: decalScale,
      rotX: decalX,
      posY: decalY
    });
  }, [
    isDark, currentModelType, currentLayoutMode, dimDiam, dimHeight, dimLidheight, dimNozzleWidth, showLid,
    colorBody, colorLid, sliderMetalness, sliderLidGloss, sliderLidTransparency, decalScale, decalX, decalY, uploadedImage, uploadedFilename
  ]);

  const handleModelTypeChange = (type: 'can' | 'cartridge') => {
    setCurrentModelType(type);
    if (type === 'can') {
      setDimDiam(65);
      setDimHeight(145);
      setDimLidheight(45);
      setColorBody('#a3a3a3');
      setColorLid('#000000');
      setSliderMetalness(0.4);
      setSliderLidGloss(0.6);
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

  const handleExportGLB = async () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    try {
      const url = await sceneRef.current.exportGLB();
      const filename = `${uploadedFilename}.glb`;
      setDownloadUrl(url);
      setDownloadFilename(filename);
      setDownloadReady(true);
      
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = url;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (e) {
      alert("Fehler beim Erstellen der 3D-Datei.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const dataUrl = sceneRef.current!.exportImage(imgQuality, imgFormat, imgTransparent);
        
        let suffix = imgQuality === '4k' ? '4K' : (imgQuality === '100' ? 'Standard' : 'Kompakt');
        let bgSuffix = (imgTransparent && imgFormat !== 'jpg') ? 'Transparent' : 'MitHG';
        let layoutSuffix = currentLayoutMode === 'double' ? 'Doppel' : 'Einzeln';
        const filename = `${uploadedFilename}-${layoutSuffix}-${suffix}-${bgSuffix}.${imgFormat}`;
        
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = dataUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        if (imgFormat === 'svg' || imgFormat === 'pdf') {
          // Object URLs need to be revoked later, but for simplicity we let them be or revoke after a delay
        }
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
      <div className={`w-full shrink-0 border-b md:border-b-0 border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 h-[100dvh]' : 'h-[45vh] sticky top-0 z-20 md:h-full md:flex-1 md:relative md:z-10 bg-slate-50 dark:bg-slate-900'}`}>
        
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded shadow-sm z-20 text-[10px] md:text-xs text-slate-600 dark:text-slate-300 pointer-events-none border border-white/50 dark:border-slate-700/50">
          <span className="font-bold">Kamera:</span> 1-Finger wischen, 2-Finger zoomen
        </div>

        <button 
          onClick={() => {
            setIsFullscreen(!isFullscreen);
            setTimeout(() => sceneRef.current?.handleResize(), 50);
          }}
          className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur p-3 md:p-2 rounded-lg shadow-lg z-20 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-600 active:scale-95"
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

        {downloadReady && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-40 flex flex-col items-center justify-center transition-opacity duration-300 px-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full border border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Download gestartet!</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-200 text-xs p-3 rounded mb-4 text-left leading-relaxed">
                Der Download sollte automatisch starten.<br/><br/>
                <strong>Falls nichts passiert (oder in der App):</strong><br/>
                Klicke nochmal auf den Button oder drücke (am Handy) <strong>lange</strong> darauf und wähle "Link herunterladen".
              </div>
              
              <a 
                href={downloadUrl} 
                download={downloadFilename} 
                onClick={() => setTimeout(() => setDownloadReady(false), 1500)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md mb-3 transition-colors"
              >
                Datei Herunterladen
              </a>
              <button onClick={() => setDownloadReady(false)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold mt-2">Abbrechen</button>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 transition-colors duration-500"></div>
      </div>

      {/* SIDEBAR UI */}
      {!isFullscreen && (
        <div className="w-full md:w-[400px] flex flex-col z-0 order-last md:order-first bg-slate-50 dark:bg-slate-900 md:border-r border-slate-200 dark:border-slate-800 shadow-2xl md:h-full md:overflow-hidden">
          
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

          <div className="p-4 flex-1 space-y-4 pb-8 md:overflow-y-auto md:min-h-0"> 
            
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <h2 className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-4">Dein Etikett (Design)</h2>

              <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg cursor-pointer bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors mb-4 relative overflow-hidden group shadow-sm">
                {isUploading && (
                  <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 flex items-center justify-center transition-opacity z-10">
                    <span className="text-white font-bold text-sm animate-pulse">Wird verarbeitet...</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-bold">{uploadText}</span>
                </div>
                <input type="file" className="hidden" accept=".pdf, .png, .jpg, .jpeg, application/pdf, image/*" onChange={handleFileUpload} />
              </label>

              <div className={`space-y-5 transition-opacity ${!uploadedImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => { setDecalScale(1.0); setDecalX(0.5); setDecalY(0.5); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition-colors active:scale-95">
                  Auf Objekt zentrieren
                </button>
                
                <div className="space-y-4 pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-blue-800 dark:text-blue-400 mb-1"><label>Größe (Umfang)</label></div>
                    <input type="range" min="0.1" max="1.5" step="0.01" value={decalScale} onChange={e => setDecalScale(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-blue-800 dark:text-blue-400 mb-1"><label>Horizontal (Links / Rechts drehen)</label></div>
                    <input type="range" min="0" max="1" step="0.01" value={decalX} onChange={e => setDecalX(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-blue-800 dark:text-blue-400 mb-1"><label>Vertikal (Oben / Unten schieben)</label></div>
                    <input type="range" min="0" max="1" step="0.01" value={decalY} onChange={e => setDecalY(parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Produkt wählen</h2>
              <div className="flex gap-2">
                <button onClick={() => handleModelTypeChange('can')} className={currentModelType === 'can' ? activeClasses : inactiveClasses}>Sprühdose</button>
                <button onClick={() => handleModelTypeChange('cartridge')} className={currentModelType === 'cartridge' ? activeClasses : inactiveClasses}>Silikonkartusche</button>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Darstellung (Layout)</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentLayoutMode('single')} className={currentLayoutMode === 'single' ? activeClasses : inactiveClasses}>Einzeln</button>
                <button onClick={() => setCurrentLayoutMode('double')} className={currentLayoutMode === 'double' ? activeClasses : inactiveClasses}>Doppel (Präsentation)</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Abmessungen</h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <label>Durchmesser (Breite)</label>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dimDiam} mm</span>
                  </div>
                  <input type="range" min="30" max="90" step="1" value={dimDiam} onChange={e => setDimDiam(parseInt(e.target.value))} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <label>Höhe (Hauptkörper)</label>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dimHeight} mm</span> 
                  </div>
                  <input type="range" min="50" max="300" step="1" value={dimHeight} onChange={e => setDimHeight(parseInt(e.target.value))} /> 
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-bold">Deckel / Düse anzeigen</label>
                    <input type="checkbox" checked={showLid} onChange={e => setShowLid(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <label>Aufsatzhöhe (Deckel/Düse)</label>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dimLidheight} mm</span>
                  </div>
                  <input type="range" min="10" max="150" step="1" value={dimLidheight} onChange={e => setDimLidheight(parseInt(e.target.value))} />
                </div>

                {currentModelType === 'cartridge' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <label>Düsenbreite & Gewinde</label>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{dimNozzleWidth} mm</span>
                    </div>
                    <input type="range" min="10" max="50" step="1" value={dimNozzleWidth} onChange={e => setDimNozzleWidth(parseInt(e.target.value))} />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider m-0">Farben & Finish</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Körperfarbe</label>
                  <input type="color" value={colorBody} onChange={e => setColorBody(e.target.value)} className="w-full h-10" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Aufsatzfarbe</label>
                  <input type="color" value={colorLid} onChange={e => setColorLid(e.target.value)} className="w-full h-10" />
                </div>
              </div>
              
              <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <label>Körper-Material (Plastik &rarr; Chrom)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderMetalness} onChange={e => setSliderMetalness(parseFloat(e.target.value))} />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <label>Aufsatz-Glanz (Matt &rarr; Lack)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderLidGloss} onChange={e => setSliderLidGloss(parseFloat(e.target.value))} />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <label>Aufsatz-Transparenz (Massiv &rarr; Glas)</label>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sliderLidTransparency} onChange={e => setSliderLidTransparency(parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
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
                  <option value="4k">4K (Ultra HD)</option>
                  <option value="100">Standard (Ansicht)</option>
                  <option value="50">Kompakt (ca. 1/2 Größe)</option>
                </select>
              </div>
              <div className={`flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 ${imgFormat === 'jpg' ? 'opacity-50' : ''}`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hintergrund:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={imgFormat === 'jpg' ? false : imgTransparent} disabled={imgFormat === 'jpg'} onChange={e => setImgTransparent(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
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
      )}
    </div>
  );
}

