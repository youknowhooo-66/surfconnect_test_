import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { Waves, LogOut, Check, Calendar, MapPin, Users, RefreshCw, AlertCircle, Phone, CheckCircle, UserCheck } from 'lucide-react';

const InstructorDashboard = () => {
  const { user, logout, apiRequest } = useAuth();
  const headerVisible = useScrollDirection();
  const [classes, setClasses] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const fetchInstructorClasses = async () => {
    try {
      setError(null);
      const data = await apiRequest('/instructor/classes');
      setClasses(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar suas aulas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorClasses();
  }, []);

  const handleMarkAttendance = async (bookingId) => {
    try {
      setError(null);
      setSuccessMsg(null);
      setActioningId(bookingId);

      const res = await apiRequest('/instructor/attendance', {
        method: 'POST',
        body: JSON.stringify({ bookingId })
      });

      setSuccessMsg(res.message || 'Presença marcada com sucesso!');
      await fetchInstructorClasses(); // Reload data
      
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err.message || 'Falha ao confirmar presença.');
    } finally {
      setActioningId(null);
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
          <p className="text-zinc-300 font-medium">Carregando cronograma de aulas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-12 text-zinc-300">
      {/* Cinematic Surf Background (Synced with Admin) */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop" 
          alt="Surf Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 text-zinc-950 rounded-xl shadow-md shadow-cyan-500/10">
              <Waves className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white">Surf<span className="text-cyan-400">Connect</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-white">{user?.name}</p>
              <span className="text-xs px-2.5 py-0.5 bg-amber-950/50 text-amber-400 font-bold rounded-full border border-amber-800/30">Instrutor</span>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8 animate-fade-in relative z-10">
        
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-950/40 border-l-4 border-red-500 text-red-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <p className="font-semibold">Confirmado!</p>
              <p className="text-sm">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white font-sans">Quadro de Aulas</h2>
            <p className="text-zinc-400 text-sm mt-0.5">Monitore seus alunos inscritos e confirme a frequência nas atividades.</p>
          </div>
          <button 
            onClick={fetchInstructorClasses}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-cyan-400 rounded-xl border border-zinc-800 shadow-sm transition-all cursor-pointer"
            title="Atualizar Quadro"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          {classes.length === 0 ? (
            <div className="bg-zinc-950/40 border border-zinc-800 p-12 text-center rounded-2xl">
              <p className="text-zinc-450 font-semibold text-lg">Nenhuma aula atribuída a você.</p>
              <p className="text-zinc-500 text-sm mt-1">Fale com o Administrador para cadastrar novas aulas com o seu perfil.</p>
            </div>
          ) : (
            classes.map((cls) => {
              const enrolledCount = cls.bookings.length;

              return (
                <div key={cls.id} className="bg-zinc-950 rounded-2xl shadow-lg border border-zinc-800 overflow-hidden">
                  
                  {/* Class Banner Info */}
                  <div className="bg-zinc-900/60 border-b border-zinc-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        {cls.location}
                      </h3>
                      <p className="text-sm text-zinc-450 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        {new Date(cls.datetime).toLocaleString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-850 self-start sm:self-auto text-zinc-400">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-semibold">
                        {enrolledCount} de {cls.maxStudents} alunos matriculados
                      </span>
                    </div>
                  </div>

                  {/* Enrolled Students list */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Lista de Alunos</h4>
                    
                    {enrolledCount === 0 ? (
                      <p className="text-zinc-500 text-sm italic">Nenhum aluno agendado para esta aula até o momento.</p>
                    ) : (
                      <div className="divide-y divide-zinc-900">
                        {cls.bookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-white">{booking.student.name}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                                <span>{booking.student.email}</span>
                                <span className="flex items-center gap-1 text-zinc-500">
                                  <Phone className="w-3.5 h-3.5" />
                                  {booking.student.telefone}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Payment status badge inside instructor panel */}
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                booking.paymentStatus === 'PAID' 
                                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40' 
                                  : 'bg-amber-950/50 text-amber-400 border-amber-800/40'
                              }`}>
                                {booking.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                              </span>

                              {booking.paymentStatus === 'PAID' ? (
                                <span className="px-3 py-1.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                  <Check className="w-4 h-4" /> Presença Confirmada
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkAttendance(booking.id)}
                                  disabled={actioningId === booking.id}
                                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  {actioningId === booking.id ? 'Marcando...' : 'Marcar Presença'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
