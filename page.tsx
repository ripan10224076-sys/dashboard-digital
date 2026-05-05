"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  // --- STATE DATA PELANGGAN ---
  const [nama, setNama] = useState("")
  const [wa, setWa] = useState("")
  const [alamat, setAlamat] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [pelanggan, setPelanggan] = useState<any[]>([])

  // --- STATE TRANSAKSI (Sesuai Kolom Database Kamu) ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPelanggan, setSelectedPelanggan] = useState<any>(null)
  const [namaLayanan, setNamaLayanan] = useState("") // Kolom: nama_layanan
  const [harga, setHarga] = useState("")             // Kolom: harga
  const [statusBayar, setStatusBayar] = useState("Belum Bayar") // Kolom: status_bayar

  // 1. Fungsi Ambil Data Pelanggan
  const ambilData = async () => {
    let query = supabase.from("pelanggan").select("*").order("created_at", { ascending: false })
    if (search) query = query.ilike('nama', `%${search}%`)
    const { data } = await query
    if (data) setPelanggan(data)
  }

  useEffect(() => { ambilData() }, [search])

  // 2. Fungsi Simpan Pelanggan Baru
  const simpanPelanggan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from("pelanggan").insert([{ nama, no_whatsapp: wa, alamat }])
    if (!error) { 
      setNama(""); setWa(""); setAlamat(""); ambilData() 
      alert("Pelanggan Berhasil Didaftarkan!")
    } else { 
      alert("Gagal simpan pelanggan: " + error.message) 
    }
    setLoading(false)
  }

  // 3. Fungsi Simpan Transaksi (Fix Constraint Error)
  const simpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.from("transaksi").insert([{ 
      pelanggan_id: selectedPelanggan.id, 
      nama_layanan: namaLayanan, 
      harga: parseInt(harga), 
      status_bayar: statusBayar // Mengirim format "Lunas" atau "Belum Bayar"
    }])

    if (!error) {
      alert(`Berhasil mencatat order untuk ${selectedPelanggan.nama}`)
      setIsModalOpen(false)
      setNamaLayanan(""); setHarga(""); setStatusBayar("Belum Bayar")
    } else {
      alert("Database Menolak: " + error.message + ". Pastikan status bayar sesuai aturan database.")
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">
      {/* Background Pattern Minimalis (Bukan AI banget) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#4F46E5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">Dashboard Digital<span className="text-indigo-600">UMKM</span></h1>
            <p className="text-slate-500 mt-1 font-medium">Sistem Manajemen Bisnis UMKM Modern</p>
          </div>
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-center mt-4 md:mt-0">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Database Pelanggan</p>
            <p className="text-2xl font-bold text-indigo-600">{pelanggan.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SISI KIRI: Registrasi Pelanggan */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm sticky top-10">
              <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
                Daftar Baru
              </h3>
              <form onSubmit={simpanPelanggan} className="space-y-4">
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm" placeholder="Nama Lengkap" required />
                <input type="text" value={wa} onChange={(e) => setWa(e.target.value)} 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm" placeholder="Nomor WhatsApp" required />
                <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm min-h-[90px]" placeholder="Alamat Pengiriman" required />
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                  {loading ? "Menyimpan..." : "Simpan Pelanggan"}
                </button>
              </form>
            </div>
          </div>

          {/* SISI KANAN: Pencarian & Daftar Kartu */}
          <div className="lg:col-span-8">
            <div className="relative mb-8">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} 
                placeholder="Cari nama pelanggan..." 
                className="w-full pl-14 pr-6 py-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none focus:border-indigo-400 transition-all" />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pelanggan.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-900 text-lg">{item.nama}</h4>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-widest">Client</div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg inline-block">{item.no_whatsapp}</p>
                    <p className="text-xs text-slate-500 italic line-clamp-1">📍 {item.alamat || "Alamat kosong"}</p>
                  </div>
                  
                  <div className="flex gap-2 border-t border-slate-100 pt-5">
                    <button onClick={() => { setSelectedPelanggan(item); setIsModalOpen(true); }}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-md">
                      💰 Catat Order
                    </button>
                    <a href={`https://wa.me/${item.no_whatsapp.replace(/^0/, '62')}`} target="_blank"
                      className="bg-green-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md shadow-green-100">
                      WA
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {pelanggan.length === 0 && (
              <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium italic">Data pelanggan tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TRANSAKSI (POPUP) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border border-white">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 font-bold">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Transaksi Baru</h2>
            <p className="text-sm text-slate-500 mb-8 border-b pb-4">Untuk: <span className="font-bold text-indigo-600">{selectedPelanggan?.nama}</span></p>
            
            <form onSubmit={simpanTransaksi} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Layanan / Barang</label>
                <input type="text" value={namaLayanan} onChange={(e) => setNamaLayanan(e.target.value)} 
                  className="w-full p-4 mt-1 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Misal: Rokok Sampoerna" required />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Harga (IDR)</label>
                <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} 
                  className="w-full p-4 mt-1 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-bold text-lg" placeholder="0" required />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select value={statusBayar} onChange={(e) => setStatusBayar(e.target.value)}
                  className="w-full p-4 mt-1 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm appearance-none">
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
                {loading ? "Menyimpan Data..." : "Konfirmasi & Simpan Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}