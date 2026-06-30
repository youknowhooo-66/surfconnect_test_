import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { Waves, LogOut, Users, Calendar, DollarSign, Plus, RefreshCw, AlertCircle, CheckCircle, MapPin, ClipboardList } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, apiRequest } = useAuth();
  const headerVisible = useScrollDirection();
  
  // Dashboard states
  const [metrics, setMetrics] = useState({ totalStudents: 0, classesToday: 0, totalEarnings: 0 });
  const [instructors, setInstructors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [classesList, setClassesList] = useState([]);

  // Form states
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [maxStudents, setMaxStudents] = useState('5');
  const [instructorId, setInstructorId] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAdminData = async () => {
    try {
      setError(null);
      const [metricsData, instructorsData, bookingsData, classesData] = await Promise.all([
        apiRequest('/admin/metrics'),
        apiRequest('/admin/instructors'),
        apiRequest('/admin/bookings'),
        apiRequest('/admin/classes')
      ]);

      setMetrics(metricsData);
      setInstructors(instructorsData);
      setBookings(bookingsData);
      setClassesList(classesData);

      // Pre-select first instructor in list if form select is empty
      if (instructorsData.length > 0 && !instructorId) {
        setInstructorId(instructorsData[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar dados administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      await apiRequest('/admin/classes', {
        method: 'POST',
        body: JSON.stringify({
          datetime,
          location,
          maxStudents,
          instructorId
        })
      });

      setSuccessMsg('Aula de surf criada com sucesso!');
      
      // Reset form
      setDatetime('');
      setLocation('');
      setMaxStudents('5');
      if (instructors.length > 0) {
        setInstructorId(instructors[0].id.toString());
      }

      // Reload lists and metrics
      await loadAdminData();

      // Clear success notification
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao criar nova aula.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center relative">
        {/* Background do Loading - Imagem Nítida com overlay suave */}
        <div className="fixed inset-0 w-full h-full -z-10">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Surf Background"
          />
          <div className="absolute inset-0 bg-zinc-900/75 backdrop-blur-[1px]"></div>
        </div>
        <div className="text-center z-10">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-300 font-medium">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 text-zinc-300 relative">
      
      {/* BACKGROUND ATUALIZADO: Imagem de alta definição cristalina + suavização do overlay */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop" 
          className="w-full h-full object-cover" 
          alt="Surf Background"
        />
        {/* Reduzido o blur para 1px e mudado o tom para um cinza escuro azulado menos agressivo */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]"></div>
      </div>

      {/* Header - Tom mais suave e integrado */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 text-zinc-950 rounded-xl shadow-md shadow-cyan-500/20">
              <Waves className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white">Surf<span className="text-cyan-400">Connect</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-white">{user?.name}</p>
              <span className="text-xs px-2.5 py-0.5 bg-red-950/40 text-red-400 font-bold rounded-full border border-red-800/30">Administrador</span>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-red-400 border border-zinc-700 rounded-xl transition-all cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8 animate-fade-in relative z-10">
        
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-950/30 border-l-4 border-red-500 text-red-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Erro no Servidor</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/30 border-l-4 border-emerald-500 text-emerald-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <p className="font-semibold">Sucesso!</p>
              <p className="text-sm">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Title & Refresh */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Painel de Administração</h2>
            <p className="text-zinc-400 text-sm mt-0.5 font-normal">Gerencie a agenda, instrutores e visualize as estatísticas financeiras.</p>
          </div>
          <button 
            onClick={loadAdminData}
            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 rounded-xl border border-zinc-800/80 shadow-md transition-all cursor-pointer"
            title="Atualizar Painel"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Metrics Cards Section - Cores dos containers suavizadas para cinza escuro fosco */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Total Alunos */}
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3 bg-cyan-950/60 text-cyan-400 border border-cyan-900/40 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total de Alunos</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{metrics.totalStudents}</p>
            </div>
          </div>

          {/* Card 2: Aulas de Hoje */}
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3 bg-amber-950/60 text-amber-400 border border-amber-900/40 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Aulas Hoje</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{metrics.classesToday}</p>
            </div>
          </div>

          {/* Card 3: Faturamento */}
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Previsão Faturamento</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                {metrics.totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </section>

        {/* Two Columns: Create Class and Classes Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Create New Class Form */}
          <section className="lg:col-span-1">
            <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 overflow-hidden">
              <div className="bg-zinc-850/40 border-b border-zinc-800/80 p-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white">Agendar Nova Aula</h3>
              </div>
              <form onSubmit={handleCreateClass} className="p-5 space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-400 mb-1">Praia / Localização</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Praia da Joaquina (SC)"
                    className="block w-full px-3 py-2.5 border border-zinc-700 rounded-xl bg-zinc-800/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-400 mb-1">Data e Horário</label>
                  <input
                    type="datetime-local"
                    required
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-zinc-700 rounded-xl bg-zinc-800/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                  />
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-400 mb-1">Instrutor Responsável</label>
                  <select
                    required
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-zinc-700 rounded-xl bg-zinc-800/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                  >
                    {instructors.length === 0 ? (
                      <option value="" className="bg-zinc-900 text-white">Nenhum instrutor cadastrado</option>
                    ) : (
                      instructors.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-zinc-900 text-white">
                          {inst.name} ({inst.telefone})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Max Students Capacity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-400 mb-1">Limite de Vagas (Alunos)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="15"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-zinc-700 rounded-xl bg-zinc-800/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || instructors.length === 0}
                  className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 shadow-cyan-500/10"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Criando...' : 'Adicionar Aula'}
                </button>
              </form>
            </div>
          </section>

          {/* 3. Existing Surf Classes List */}
          <section className="lg:col-span-2 space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-cyan-400" /> Agenda Escolar
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classesList.length === 0 ? (
                <div className="col-span-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-8 text-center rounded-2xl">
                  <p className="text-zinc-400 text-sm italic">Nenhuma aula na agenda ainda.</p>
                </div>
              ) : (
                classesList.map((c) => {
                  const bookedCount = c.bookings.length;

                  return (
                    <div key={c.id} className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 p-5 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Aula #{c.id}</span>
                          <span className="text-xs px-2.5 py-0.5 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 font-bold rounded-full">
                            {bookedCount} / {c.maxStudents} Vagas
                          </span>
                        </div>
                        
                        <h5 className="font-bold text-white flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          {c.location}
                        </h5>

                        <p className="text-xs text-zinc-300">
                          <strong>Data:</strong> {new Date(c.datetime).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-zinc-800 text-xs text-zinc-400">
                        <strong>Instrutor:</strong> {c.instructor.name}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* 4. Bookings Management Table */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-1.5">
            <ClipboardList className="w-6 h-6 text-cyan-400" /> Todos os Agendamentos do Sistema
          </h3>
          
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800/80 overflow-hidden">
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-800/50 border-b border-zinc-800 text-zinc-300 text-xs font-bold tracking-wider uppercase">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Aluno</th>
                    <th className="py-4 px-6">WhatsApp</th>
                    <th className="py-4 px-6">Aula / Local</th>
                    <th className="py-4 px-6">Horário da Aula</th>
                    <th className="py-4 px-6">Instrutor</th>
                    <th className="py-4 px-6">Matrícula</th>
                    <th className="py-4 px-6">Financeiro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 px-6 text-center text-zinc-500 font-medium italic">
                        Nenhum agendamento realizado no sistema.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-zinc-400">#{b.id}</td>
                        <td className="py-4 px-6 font-bold text-white">{b.student.name}</td>
                        <td className="py-4 px-6 text-zinc-300 font-mono text-xs">{b.student.telefone}</td>
                        <td className="py-4 px-6">{b.class.location}</td>
                        <td className="py-4 px-6 text-xs text-zinc-400 font-mono">
                          {new Date(b.class.datetime).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 text-zinc-300">{b.class.instructor.name}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            b.status === 'CONFIRMED' 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                              : 'bg-red-950/40 text-red-400 border-red-800/40'
                          }`}>
                            {b.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            b.paymentStatus === 'PAID' 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}>
                            {b.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;