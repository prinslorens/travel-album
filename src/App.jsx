import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import confetti from 'canvas-confetti';
import { 
  Plus, MapPin, Calendar, Heart, Image as ImageIcon, 
  Sparkles, X, Upload, Loader2, Maximize2, Compass, Trash2
} from 'lucide-react';

export default function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setPlaces(data || []);
    setLoading(false);
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!imageFile || !title) return alert("Please select a photo and enter a title!");

    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('places')
        .insert([{ title, location, date, note, image_url: imageUrl }]);

      if (insertError) throw insertError;

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      setTitle(''); setLocation(''); setDate(''); setNote(''); setImageFile(null);
      setIsModalOpen(false);
      fetchPlaces();
    } catch (err) {
      alert("Error saving place: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // DELETE PLACE FUNCTION
  const handleDeletePlace = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (selectedPhoto && selectedPhoto.id === id) {
        setSelectedPhoto(null);
      }

      fetchPlaces();
    } catch (err) {
      alert("Error deleting place: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-3', 'rotate-3', '-rotate-1'];

  return (
    <div className="min-h-screen bg-[#2c221e] text-[#4a3b32] p-4 sm:p-8 relative overflow-x-hidden font-serif select-none">
      
      {/* Background Vintage Texture Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#8c6d58_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#d9b382]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* VINTAGE HEADER BANNER */}
        <div className="bg-[#f4ebd9] border-4 border-[#b89774] rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-4">
          
          <div className="absolute top-4 right-6 border-2 border-dashed border-[#a67c52] p-2 rounded-lg text-[10px] tracking-widest text-[#a67c52] font-mono transform rotate-6 opacity-70 hidden sm:block">
            PASSPORT STAMP • ADVENTURES
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#e6d5bc] border border-[#c4ab8c] text-[#735338] text-xs font-sans font-bold tracking-wider">
            <Compass size={14} /> OUR TRAVEL SCRAPBOOK
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#3d2b1f] tracking-tight font-serif italic">
            Prince & Sheika’s Journal 📜
          </h1>

          {/* Button & Sub-text at the Bottom */}
          <div className="pt-2 flex flex-col items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#8c3a3a] hover:bg-[#732d2d] text-[#f7eee1] font-sans font-bold text-xs inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer border border-[#b85c5c]"
            >
              <Plus size={18} /> Add Memory 📌
            </button>
            <p className="text-[11px] text-[#735d4d] font-sans italic opacity-80">
              Click any photo to zoom and view details, or click the trash icon to delete.
            </p>
          </div>
        </div>

        {/* SCRAPBOOK GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#c7b299] gap-3 font-sans">
            <Loader2 className="animate-spin text-[#d99b70]" size={36} />
            <p className="text-xs">Loading vintage journal...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-16 bg-[#f4ebd9]/10 rounded-3xl border-2 border-dashed border-[#8c735d]/40 p-8 space-y-3 max-w-md mx-auto font-sans">
            <ImageIcon className="mx-auto text-[#8c735d]" size={48} />
            <h3 className="text-sm font-bold text-[#e6d5bc]">No memories added yet!</h3>
            <p className="text-xs text-[#b39b86]">Click the button above to pin your first memory together.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 sm:px-4">
            {places.map((item, index) => {
              const rotateClass = rotations[index % rotations.length];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03, rotate: 0, zIndex: 20 }}
                  onClick={() => setSelectedPhoto(item)}
                  className={`bg-[#f7eee1] p-4 rounded-xl shadow-2xl transition-all duration-300 relative border-2 border-[#d4c3ab] cursor-pointer group ${rotateClass}`}
                >
                  {/* Vintage Paper Tape Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#e6d7be]/80 border border-[#c2b297] backdrop-blur-sm transform -rotate-1 shadow-sm z-10" />

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeletePlace(item.id, e)}
                    disabled={deletingId === item.id}
                    title="Delete Memory"
                    className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#8c3a3a] text-[#f7eee1] hover:bg-[#6b2929] transition-all opacity-80 group-hover:opacity-100 shadow-md cursor-pointer border border-[#b85c5c]"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>

                  {/* Photo Frame */}
                  <div className="h-64 w-full bg-[#362b26] overflow-hidden rounded-lg relative shadow-inner mb-3">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover sepia-[0.25] group-hover:sepia-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-sans text-xs gap-1 font-bold">
                      <Maximize2 size={16} /> Click to View
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-left font-serif">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-[#3d2b1f] leading-tight pr-6">{item.title}</h3>
                      {item.date && (
                        <span className="text-[10px] font-sans font-bold bg-[#e3d0b8] text-[#5e432d] px-2 py-0.5 rounded border border-[#c7b299] whitespace-nowrap">
                          {item.date}
                        </span>
                      )}
                    </div>

                    {item.location && (
                      <p className="text-xs font-sans text-[#8c3a3a] font-semibold flex items-center gap-1">
                        <MapPin size={12} /> {item.location}
                      </p>
                    )}

                    {item.note && (
                      <p className="text-xs font-sans text-[#5c4a3e] pt-1.5 border-t border-[#dfd0bc] italic line-clamp-2">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* CLICKABLE PHOTO ZOOM MODAL WITH DELETE */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#f7eee1] border-4 border-[#b89774] rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl text-[#3d2b1f]"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => handleDeletePlace(selectedPhoto.id)}
                  className="p-2 rounded-full bg-[#8c3a3a] text-[#f7eee1] hover:bg-[#6b2929] cursor-pointer border border-[#b85c5c]"
                  title="Delete Memory"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setSelectedPhoto(null)} 
                  className="p-2 rounded-full bg-[#e6d5bc] text-[#5e432d] hover:bg-[#d9c3a3] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="w-full max-h-[380px] bg-black/10 rounded-2xl overflow-hidden border-2 border-[#d4c3ab]">
                <img 
                  src={selectedPhoto.image_url} 
                  alt={selectedPhoto.title} 
                  className="w-full h-full object-contain max-h-[380px] mx-auto"
                />
              </div>

              <div className="space-y-2 text-left font-serif pt-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#3d2b1f]">{selectedPhoto.title}</h2>
                  {selectedPhoto.date && (
                    <span className="text-xs font-sans font-bold bg-[#e3d0b8] text-[#5e432d] px-3 py-1 rounded-full border border-[#c7b299]">
                      {selectedPhoto.date}
                    </span>
                  )}
                </div>

                {selectedPhoto.location && (
                  <p className="text-xs font-sans text-[#8c3a3a] font-bold flex items-center gap-1">
                    <MapPin size={14} /> {selectedPhoto.location}
                  </p>
                )}

                {selectedPhoto.note && (
                  <div className="p-4 rounded-xl bg-[#ede2cf] border border-[#d4c3ab] text-xs font-sans text-[#4a3a2f] italic leading-relaxed">
                    "{selectedPhoto.note}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MEMORY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#261f1c] border-2 border-[#8c735d] rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl text-[#f4ebd9] font-sans"
            >
              <div className="flex items-center justify-between border-b border-[#594638] pb-3">
                <h2 className="text-base font-bold text-[#f4ebd9] font-serif flex items-center gap-2">
                  <Heart className="text-[#d96b6b]" size={18} fill="currentColor" /> Add New Memory
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#b39b86] hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPlace} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#c4b19c] mb-1 font-semibold">Title / Place Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#181311] border border-[#594638] rounded-xl p-3 text-white focus:outline-none focus:border-[#d99b70]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#c4b19c] mb-1 font-semibold">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#181311] border border-[#594638] rounded-xl p-3 text-white focus:outline-none focus:border-[#d99b70]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#c4b19c] mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#181311] border border-[#594638] rounded-xl p-3 text-white focus:outline-none focus:border-[#d99b70]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#c4b19c] mb-1 font-semibold">Short Note / Caption</label>
                  <textarea
                    rows="2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#181311] border border-[#594638] rounded-xl p-3 text-white focus:outline-none focus:border-[#d99b70]"
                  />
                </div>

                <div>
                  <label className="block text-[#c4b19c] mb-1 font-semibold">Select Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full text-[#c4b19c] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#473428] file:text-[#f4ebd9] hover:file:bg-[#5e4536] cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-[#8c3a3a] hover:bg-[#732d2d] text-[#f7eee1] font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer border border-[#b85c5c]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Saving to journal...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Save Memory to Journal
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}