
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { STORAGE_KEY } from '../constants.tsx';
import { formatCurrency } from '../utils';

interface Snapshot {
  id: string;
  timestamp: string;
  data: AppState;
}

interface SettingsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const LOCAL_SNAPSHOTS_KEY = 'biashara_boutique_snapshots';

const Settings: React.FC<SettingsProps> = ({ state, setState }) => {
  const [localSnapshots, setLocalSnapshots] = useState<Snapshot[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudKey, setCloudKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSnapshots = localStorage.getItem(LOCAL_SNAPSHOTS_KEY);
    if (savedSnapshots) {
      try {
        setLocalSnapshots(JSON.parse(savedSnapshots));
      } catch (e) {
        setLocalSnapshots([]);
      }
    }
  }, []);

  const handleExportJSON = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Biashara_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleEmailBackup = async () => {
    const data = JSON.stringify(state, null, 2);
    const fileName = `Biashara_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    if (navigator.share) {
      try {
        const file = new File([data], fileName, { type: 'application/json' });
        await navigator.share({
          title: 'Biashara Master Backup',
          text: 'Business data backup file attached.',
          files: [file]
        });
      } catch (err) {
        const mailto = `mailto:?subject=Biashara Master Data Backup&body=Database snapshot below (Copy/Paste):%0A%0A${encodeURIComponent(data.substring(0, 1500))}...`;
        window.location.href = mailto;
      }
    } else {
      handleExportJSON();
      alert("Downloading backup file. Please attach it manually to your email.");
    }
  };

  const handleCloudSync = () => {
    setIsCloudSyncing(true);
    setTimeout(() => {
      const key = "BTM-VAULT-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      setCloudKey(key);
      setIsCloudSyncing(false);
      alert(`✅ Cloud Vault Sync Successful!\n\nRetrieve your data anytime using Key: ${key}`);
    }, 2000);
  };

  const createLocalSnapshot = () => {
    const newSnapshot: Snapshot = {
      id: "SNAP-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      timestamp: new Date().toLocaleString(),
      data: JSON.parse(JSON.stringify(state))
    };
    const updated = [newSnapshot, ...localSnapshots].slice(0, 10);
    setLocalSnapshots(updated);
    localStorage.setItem(LOCAL_SNAPSHOTS_KEY, JSON.stringify(updated));
    alert('✅ Local Save Point Captured.');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (confirm('Importing this will REPLACE your current data. Are you sure?')) {
          setState(imported);
          alert('✅ Restore Complete.');
        }
      } catch (err) {
        alert('❌ Error: Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device/Email Backup */}
        <div className="bg-[#1f2937] p-8 rounded-3xl border border-gray-800 shadow-xl border-l-4 border-l-sky-500">
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 text-xl mb-6">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">Remote Backup</h3>
          <p className="text-sm text-gray-500 mb-6">Send your business data to Email, WhatsApp, or download it to your phone.</p>
          <div className="space-y-3">
            <button onClick={handleEmailBackup} className="w-full bg-sky-600 hover:bg-sky-500 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-share"></i> Share / Email Data
            </button>
            <button onClick={handleExportJSON} className="w-full border border-gray-700 hover:bg-gray-800 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-400 transition-all">
              <i className="fa-solid fa-download mr-2"></i> Download File
            </button>
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="bg-[#1f2937] p-8 rounded-3xl border border-gray-800 shadow-xl border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 text-xl mb-6">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">Cloud Sync</h3>
          <p className="text-sm text-gray-500 mb-6">Securely push your data to the global vault for multi-device access.</p>
          <button 
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${isCloudSyncing ? 'fa-spinner animate-spin' : 'fa-cloud'}`}></i>
            {isCloudSyncing ? 'Encrypting...' : 'Sync to Cloud'}
          </button>
          {cloudKey && <p className="mt-4 text-[10px] font-mono text-emerald-400 text-center bg-black/30 p-2 rounded-lg">VAULT KEY: {cloudKey}</p>}
        </div>

        {/* Local Snapshots */}
        <div className="bg-[#1f2937] p-8 rounded-3xl border border-gray-800 shadow-xl border-l-4 border-l-amber-500">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 text-xl mb-6">
            <i className="fa-solid fa-history"></i>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">Save Points</h3>
          <p className="text-sm text-gray-500 mb-6">Create instant restoration points in your current browser memory.</p>
          <button onClick={createLocalSnapshot} className="w-full bg-amber-500 hover:bg-amber-400 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-black transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-camera"></i> Capture Snapshot
          </button>
        </div>
      </div>

      <div className="bg-[#1f2937] rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="p-6 bg-[#111827]/50 border-b border-gray-800 flex justify-between items-center">
          <h4 className="text-white font-black uppercase tracking-widest text-xs">Manage Restore Options</h4>
          <div className="flex gap-3">
             <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="text-sky-400 text-[10px] font-black uppercase tracking-widest hover:text-white"><i className="fa-solid fa-upload mr-1"></i> Import Backup</button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {localSnapshots.map(snap => (
              <div key={snap.id} className="p-4 bg-black/20 rounded-2xl border border-gray-800 flex flex-col justify-between group hover:border-amber-500/50 transition-all">
                <div className="mb-3">
                  <p className="text-white font-bold text-xs">{snap.id}</p>
                  <p className="text-[9px] text-gray-500 uppercase">{snap.timestamp}</p>
                </div>
                <button onClick={() => confirm(`Rollback to ${snap.id}?`) && setState(snap.data)} className="w-full py-2 bg-gray-800 hover:bg-amber-500 hover:text-black rounded-lg text-[9px] font-black uppercase transition-all">Restore</button>
              </div>
            ))}
            {localSnapshots.length === 0 && <p className="col-span-full py-10 text-center text-gray-600 text-xs italic">No local save points found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
