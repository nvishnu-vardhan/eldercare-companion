
import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Sun, Camera, Mic, MapPin, StopCircle, X, Image as ImageIcon, Video } from 'lucide-react';
import { generateElderResponse } from '../services/geminiService';
import { Message, UserRole, Media } from '../types';

interface ParentChatProps {
  onNewLog: (msg: Message) => void;
}

const ParentChat: React.FC<ParentChatProps> = ({ onNewLog }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello Aunty/Uncle, how are you today? Did you take your medicine this morning?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<Media | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSend = async (overrideText?: string, overrideMedia?: Media, overrideLocation?: { lat: number, lng: number }) => {
    const textToSend = overrideText || input;
    const mediaToSend = overrideMedia || pendingMedia;

    if (!textToSend.trim() && !mediaToSend && !overrideLocation) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      media: mediaToSend || undefined,
      location: overrideLocation
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingMedia(null);
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content, media: m.media }));
    // Append current message to history for the API call
    history.push({ role: userMsg.role, content: userMsg.content, media: userMsg.media });

    const responseText = await generateElderResponse(
      overrideLocation ? `I'm at these coordinates: ${overrideLocation.lat}, ${overrideLocation.lng}` : textToSend, 
      UserRole.PARENT, 
      history
    );

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
    onNewLog(userMsg);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setPendingMedia({ data: base64, mimeType: 'audio/webm', url });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);
      setPendingMedia({ data: base64, mimeType: file.type, url });
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        handleSend("I am sharing my current location.", undefined, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      }, (err) => {
        alert("Could not get location. Please enable GPS.");
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-orange-50/30">
      <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Heart className="text-orange-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">ElderCare Assistant</h2>
            <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Family Connection Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          <Sun size={18} />
          <span className="font-medium text-sm">Sunny 28°C</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-lg ${
              msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-orange-100'
            }`}>
              {msg.media && (
                <div className="mb-2 overflow-hidden rounded-lg bg-black/5">
                  {msg.media.mimeType.startsWith('image/') && (
                    <img src={msg.media.url || `data:${msg.media.mimeType};base64,${msg.media.data}`} alt="Shared" className="w-full max-h-64 object-cover" />
                  )}
                  {msg.media.mimeType.startsWith('video/') && (
                    <video controls src={msg.media.url || `data:${msg.media.mimeType};base64,${msg.media.data}`} className="w-full max-h-64" />
                  )}
                  {msg.media.mimeType.startsWith('audio/') && (
                    <audio controls src={msg.media.url || `data:${msg.media.mimeType};base64,${msg.media.data}`} className="w-full" />
                  )}
                </div>
              )}
              {msg.location && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded-lg text-sm">
                  <MapPin size={16} />
                  <span>Shared Location: {msg.location.lat.toFixed(4)}, {msg.location.lng.toFixed(4)}</span>
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-orange-100 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t space-y-3">
        {pendingMedia && (
          <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-xl border border-orange-200 relative animate-in fade-in slide-in-from-bottom-2">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
              {pendingMedia.mimeType.startsWith('image/') ? <ImageIcon className="text-orange-500" /> : <Mic className="text-orange-500" />}
            </div>
            <span className="text-sm font-medium text-orange-800">Media ready to send...</span>
            <button onClick={() => setPendingMedia(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200" title="Share Photo/Video">
              <Camera size={24} />
            </button>
            <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
              className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Record Voice">
              {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={shareLocation} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200" title="Share Location">
              <MapPin size={24} />
            </button>
          </div>
          <div className="flex-1 flex gap-2 items-center bg-gray-50 p-1 rounded-2xl border border-gray-200 focus-within:border-orange-300 transition-colors">
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type or use buttons..." className="flex-1 bg-transparent p-3 text-lg outline-none"
            />
            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !pendingMedia)}
              className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50">
              <Send size={24} />
            </button>
          </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hold Mic to Record Voice • Tap Location to Stay Safe</p>
      </div>
    </div>
  );
};

export default ParentChat;
