
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Camera, Leaf, Flower, Info, Loader2, Sparkles, ChevronRight, X, ArrowRight, Image as ImageIcon, Upload, User } from 'lucide-react';
import { identifyAndAnalyzePlant, generatePlantImage, getRandomPlants } from './services/geminiService';
import { BotanicalInfo } from './types';
import { ApparatusCard } from './components/ApparatusCard';
import { SVGViewer } from './components/SVGViewer';

interface FeaturedPlant {
  name: string;
  scientific: string;
  family: string;
  description: string;
  image?: string;
  id: string;
}

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BotanicalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featuredPlants, setFeaturedPlants] = useState<FeaturedPlant[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionFileInputRef = useRef<HTMLInputElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial loading of hero and first batch
  useEffect(() => {
    const initApp = async () => {
      try {
        const hero = await generatePlantImage("A breathtaking lush tropical botanical garden with diverse exotic plants, sunlight filtering through leaves, 8k resolution, cinematic atmosphere");
        setHeroImage(hero);
      } catch (e) {
        console.error("Failed to load hero image");
      }
      loadMorePlants();
    };
    initApp();
  }, []);

  const loadMorePlants = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const existingNames = featuredPlants.map(p => p.scientific);
      const newPlants = await getRandomPlants(3, existingNames);
      
      const plantsWithImages = await Promise.all(newPlants.map(async (p) => {
        try {
          const img = await generatePlantImage(p.scientific);
          return { ...p, id: Math.random().toString(36).substr(2, 9), image: img };
        } catch (err) {
          return { ...p, id: Math.random().toString(36).substr(2, 9) };
        }
      }));

      setFeaturedPlants(prev => [...prev, ...plantsWithImages]);
    } catch (err) {
      console.error("Failed to load more plants", err);
    } finally {
      setLoadingMore(false);
    }
  }, [featuredPlants, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !result) {
          loadMorePlants();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMorePlants, loading, result]);

  const handleSearch = async (query: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const data = await identifyAndAnalyzePlant(query);
      setResult(data);
    } catch (err) {
      setError("Désolé, l'analyse a échoué. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const data = await identifyAndAnalyzePlant(file);
      setResult(data);
    } catch (err) {
      setError("Impossible d'identifier cette photo. Assurez-vous que la plante est bien visible.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSearchTerm('');
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="bg-emerald-600 p-1.5 rounded-xl text-white shadow-lg shadow-emerald-200">
            <Leaf size={24} />
          </div>
          <span className="text-2xl font-bold font-serif text-slate-800 tracking-tight">Spesflore</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <Camera size={24} />
          </button>
        </div>
      </header>

      <main>
        {!result && !loading && (
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                style={{ 
                  backgroundImage: heroImage ? `url(${heroImage})` : 'none',
                  backgroundColor: '#064e3b'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-slate-50" />
              </div>

              {/* Developer Bubble */}
              <div className="absolute top-8 right-8 z-30 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 to-white rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden cursor-help bg-slate-200">
                    {/* Note: In a production app, the dev photo would be a local asset or a static URL */}
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200" 
                      alt="Développeur" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-full mt-2 right-0 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none whitespace-nowrap">
                    <p className="text-xs font-bold text-slate-800">Conçu par le Développeur</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Expert en IA & Botanique</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                  <Sparkles size={16} />
                  <span>L'intelligence artificielle au service de la botanique</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-2xl">
                  Explorez la <span className="text-emerald-400 italic">morphologie</span> végétale
                </h1>
                <p className="text-emerald-50 max-w-lg mx-auto text-lg md:text-xl drop-shadow-md">
                  Analysez l'appareil végétatif et reproducteur de n'importe quelle plante en un instant.
                </p>

                <form onSubmit={(e) => handleSearch(searchTerm, e)} className="relative max-w-2xl mx-auto mt-10">
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom..."
                    className="w-full pl-8 pr-20 py-6 bg-white border-none rounded-full shadow-2xl shadow-emerald-900/40 focus:ring-4 focus:ring-emerald-500/50 outline-none text-xl transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-3 bottom-3 aspect-square bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <Search size={28} />
                  </button>
                </form>
              </div>
            </section>

            {/* Dedicated Photo Import Section */}
            <section className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
              <div className="bg-white rounded-[3rem] p-1 shadow-2xl shadow-emerald-900/10">
                <div className="bg-emerald-50/50 rounded-[2.8rem] border-2 border-dashed border-emerald-200 p-8 md:p-12 text-center flex flex-col items-center gap-6 group hover:border-emerald-400 transition-colors">
                  <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                    <Camera size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-serif text-slate-900">Identification Visuelle</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Importez une photo de votre appareil pour obtenir une analyse complète : appareil végétatif, formule florale et diagrammes.
                    </p>
                  </div>
                  <input 
                    type="file" 
                    ref={sectionFileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    onClick={() => sectionFileInputRef.current?.click()}
                    className="px-10 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 transition-all flex items-center gap-3"
                  >
                    <Upload size={22} />
                    <span>Choisir une photo</span>
                  </button>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Prend en charge JPG, PNG et formats mobiles</p>
                </div>
              </div>
            </section>

            {/* Infinite Exploration Section */}
            <section className="max-w-6xl mx-auto px-6 space-y-12 pb-20">
              <div className="text-center space-y-2 border-b border-slate-200 pb-10">
                <h3 className="text-4xl font-serif text-slate-900">Herbier Digital</h3>
                <p className="text-slate-500 text-lg">Laissez-vous inspirer par la diversité botanique.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredPlants.map((plant) => (
                  <div 
                    key={plant.id}
                    onClick={() => handleSearch(plant.scientific)}
                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full"
                  >
                    <div className="h-80 bg-slate-100 relative overflow-hidden">
                      {plant.image ? (
                        <img 
                          src={plant.image} 
                          alt={plant.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <Loader2 className="animate-spin text-emerald-600" size={32} />
                          <span className="text-xs font-medium text-slate-400">Génération de l'image...</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1 block">{plant.family}</span>
                         <h4 className="text-2xl font-serif leading-tight">{plant.name}</h4>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                        {plant.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                        <span className="text-xs font-mono text-slate-400 italic truncate max-w-[150px]">{plant.scientific}</span>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <span>Détails</span>
                          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                            <ArrowRight size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center gap-4">
                {loadingMore && (
                  <>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">Chargement de nouvelles espèces...</p>
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {loading && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <Leaf className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif text-slate-800 animate-pulse mb-2">Analyse Scientifique</p>
              <p className="text-slate-400 text-sm italic max-w-md mx-auto">Vérification de l'appareil reproducteur, étude de l'ovaire et génération des diagrammes floraux...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mt-20 p-8 bg-red-50 text-red-700 rounded-[2.5rem] border border-red-100 flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Info size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Analyse interrompue</h3>
              <p className="text-red-600/80 mb-6">{error}</p>
              <button 
                onClick={reset} 
                className="px-8 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-5xl mx-auto px-6 space-y-12 py-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-sm font-bold uppercase tracking-widest">{result.family}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span className="text-sm font-medium text-slate-400">Classification Scientifique</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-serif text-slate-900">{result.commonName}</h2>
                <p className="text-2xl text-emerald-600/60 italic font-light font-serif">{result.scientificName}</p>
              </div>
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all text-sm font-bold shadow-sm"
              >
                <X size={18} />
                <span>Nouvelle recherche</span>
              </button>
            </div>

            <div className="bg-emerald-900 text-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-emerald-900/30 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <Flower size={300} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-emerald-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">Structure Florale</h3>
                  <div className="text-4xl md:text-6xl font-mono font-bold tracking-[0.1em] text-emerald-50 drop-shadow-lg">
                    {result.floralFormula}
                  </div>
                  <p className="text-emerald-200/60 text-sm mt-4 italic font-light">Formule florale standardisée</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hidden md:block">
                   <Info className="text-emerald-400" size={24} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <ApparatusCard 
                title="Appareil Végétatif" 
                icon={<Leaf size={24} />} 
                data={result.vegetativeApparatus} 
              />
              <ApparatusCard 
                title="Appareil Reproducteur" 
                icon={<Flower size={24} />} 
                data={result.reproductiveApparatus} 
              />
            </div>

            <div className="space-y-10 pt-10">
              <div className="flex items-center gap-4">
                <div className="h-0.5 flex-grow bg-slate-200" />
                <h3 className="text-3xl font-serif text-slate-800 px-4">Planches Anatomiques</h3>
                <div className="h-0.5 flex-grow bg-slate-200" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SVGViewer 
                  title="Diagramme Floral" 
                  svgContent={result.floralDiagramSVG} 
                />
                <SVGViewer 
                  title="Inflorescence" 
                  svgContent={result.inflorescenceSVG} 
                />
                <SVGViewer 
                  title="Coupe de l'Ovaire" 
                  svgContent={result.ovarySectionSVG} 
                />
              </div>
            </div>

            <div className="p-10 bg-slate-900 text-slate-400 rounded-[3rem] text-base leading-relaxed border-t-8 border-emerald-600 shadow-2xl">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-400" />
                Synthèse Botanique Spesflore
              </h4>
              <p>
                L'étude de cette espèce révèle des caractéristiques morphologiques clés. L'appareil végétatif (racines, tiges, feuilles) témoigne de ses adaptations environnementales, tandis que l'appareil reproducteur (inflorescence, structure ovarienne) permet de confirmer son appartenance à la famille des <span className="text-emerald-400 font-bold underline underline-offset-8 decoration-emerald-800/50">{result.family}</span>. Cette fiche technique est destinée à faciliter l'identification taxinomique rigoureuse.
              </p>
            </div>
          </div>
        )}
      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      {!loading && !result && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="md:hidden fixed bottom-10 right-8 w-18 h-18 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 border-4 border-white"
        >
          <Camera size={32} />
        </button>
      )}
    </div>
  );
};

export default App;
