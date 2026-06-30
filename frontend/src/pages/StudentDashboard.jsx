import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { Waves, LogOut, CloudSun, MapPin, Calendar, User, CheckCircle2, AlertCircle, RefreshCw, X, CreditCard } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout, apiRequest } = useAuth();
  const headerVisible = useScrollDirection();
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [weather, setWeather] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activePixBooking, setActivePixBooking] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      // Fetch Weather, Available Classes, and Bookings concurrently
      const [weatherData, classesData, bookingsData] = await Promise.all([
        apiRequest('/weather'),
        apiRequest('/student/classes'),
        apiRequest('/student/bookings')
      ]);

      setWeather(weatherData);
      setClasses(classesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBooking = async (classId) => {
    try {
      setError(null);
      setSuccessMsg(null);
      
      const res = await apiRequest('/student/bookings', {
        method: 'POST',
        body: JSON.stringify({ classId })
      });

      setSuccessMsg(res.message || 'Aula agendada com sucesso!');
      
      // Auto open mock payment dialog
      if (res.booking) {
        setActivePixBooking(res.booking);
      }

      // Refresh data
      await fetchDashboardData();
      
      // Clear success banner after 5s
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err.message || 'Falha ao realizar agendamento.');
    }
  };

  // Helper: check if student has booked this class
  const isAlreadyBooked = (classId) => {
    return bookings.some(b => b.classId === classId && b.status === 'CONFIRMED');
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
          <p className="text-zinc-300 font-medium">Carregando ondas e aulas...</p>
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

      {/* Premium Header */}
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
              <span className="text-xs px-2.5 py-0.5 bg-cyan-950/50 text-cyan-400 font-bold rounded-full border border-cyan-800/30">Aluno</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8 animate-fade-in relative z-10">
        
        {/* Alerts Banner */}
        {error && (
          <div className="p-4 bg-red-950/40 border-l-4 border-red-500 text-red-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Atenção</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-200 rounded-r-xl flex items-start gap-3 shadow-sm border border-zinc-800">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <p className="font-semibold">Sucesso!</p>
              <p className="text-sm">{successMsg}</p>
            </div>
          </div>
        )}

        {/* 1. Dynamic Weather Card widget */}
        {weather && (
          <div className="glass-card p-6 rounded-2xl shadow-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none text-cyan-500">
              <CloudSun className="w-48 h-48" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <CloudSun className="w-6 h-6 animate-pulse" />
                  <span className="font-bold text-sm tracking-wide uppercase">Previsão das Ondas e Clima</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{weather.location}</h2>
                <p className="text-zinc-400 max-w-2xl text-sm">{weather.summary}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                <div className="text-center p-2">
                  <p className="text-xs text-zinc-500 font-semibold uppercase">Ondas</p>
                  <p className="text-lg font-bold text-cyan-400">{weather.waves}</p>
                </div>
                <div className="text-center p-2 border-l border-zinc-850">
                  <p className="text-xs text-zinc-500 font-semibold uppercase">Vento</p>
                  <p className="text-lg font-bold text-cyan-400">{weather.wind}</p>
                </div>
                <div className="text-center p-2 border-l border-zinc-850">
                  <p className="text-xs text-zinc-500 font-semibold uppercase">Água</p>
                  <p className="text-lg font-bold text-cyan-400">{weather.waterTemp}</p>
                </div>
                <div className="text-center p-2 border-l border-zinc-850">
                  <p className="text-xs text-zinc-500 font-semibold uppercase">Condição</p>
                  <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-800/30">
                    {weather.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Available Classes Schedule */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              📅 Aulas Disponíveis
            </h3>
            <button 
              onClick={fetchDashboardData}
              className="p-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-cyan-400 rounded-xl border border-zinc-800 shadow-sm transition-all cursor-pointer"
              title="Atualizar Aulas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length === 0 ? (
              <div className="col-span-full bg-zinc-950/40 border border-zinc-800/60 p-8 text-center rounded-2xl">
                <p className="text-zinc-500 font-medium">Nenhuma aula cadastrada no momento.</p>
              </div>
            ) : (
              classes.map((cls) => {
                const booked = isAlreadyBooked(cls.id);
                const isFull = cls.slotsLeft <= 0;

                return (
                  <div 
                    key={cls.id} 
                    className={`bg-zinc-950 rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between border-zinc-800 hover:border-zinc-700 ${
                      booked ? 'border-cyan-500/50 ring-2 ring-cyan-500/10' : ''
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Class Spot availability indicator */}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2.5 py-0.5 font-bold rounded-full border ${
                          isFull 
                            ? 'bg-red-950/50 text-red-400 border-red-800/30' 
                            : cls.slotsLeft === 1 
                              ? 'bg-amber-950/50 text-amber-400 border-amber-800/30' 
                              : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30'
                        }`}>
                          {isFull ? 'Lotada' : `${cls.slotsLeft} vagas restando`}
                        </span>
                        
                        {booked && (
                          <span className="text-xs px-2.5 py-0.5 bg-cyan-950/50 text-cyan-400 border border-cyan-800/30 font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Agendada
                          </span>
                        )}
                      </div>

                      {/* Location and Info */}
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          {cls.location}
                        </h4>
                        
                        <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          {new Date(cls.datetime).toLocaleString('pt-BR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>

                        <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          Instrutor: <span className="font-semibold text-white ml-1">{cls.instructorName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-3 bg-zinc-900/40 border-t border-zinc-800/80">
                      <button
                        onClick={() => handleBooking(cls.id)}
                        disabled={isFull || booked}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 ${
                          booked 
                            ? 'bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed'
                            : isFull 
                              ? 'bg-red-950/20 text-red-500/60 border border-red-950/40 cursor-not-allowed' 
                              : 'bg-cyan-500 hover:bg-cyan-600 text-zinc-950 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-cyan-500/5 hover:shadow-cyan-500/15'
                        }`}
                      >
                        {booked ? 'Você já vai participar' : isFull ? 'Turma Esgotada' : 'Agendar Aula'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 3. Personal Booking History */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            🏄‍♂️ Meu Histórico de Agendamentos
          </h3>

          <div className="bg-zinc-950 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider uppercase">
                    <th className="py-4 px-6">Local / Praia</th>
                    <th className="py-4 px-6">Data e Hora</th>
                    <th className="py-4 px-6">Instrutor</th>
                    <th className="py-4 px-6">Status Reserva</th>
                    <th className="py-4 px-6">Pagamento</th>
                    <th className="py-4 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-sm">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 px-6 text-center text-zinc-500 font-medium">
                        Você ainda não fez nenhum agendamento.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {booking.class.location}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                          {new Date(booking.class.datetime).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 text-zinc-400">
                          {booking.class.instructor.name}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            booking.status === 'CONFIRMED' 
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40' 
                              : 'bg-red-950/50 text-red-400 border-red-800/40'
                          }`}>
                            {booking.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            booking.paymentStatus === 'PAID' 
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40' 
                              : 'bg-amber-950/50 text-amber-400 border-amber-800/40 animate-pulse'
                          }`}>
                            {booking.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {booking.paymentStatus === 'PENDING' && booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => setActivePixBooking(booking)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer shadow-cyan-500/10 hover:shadow-cyan-500/20"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pagar Pix
                            </button>
                          )}
                          {booking.paymentStatus === 'PAID' && (
                            <span className="text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Vaga Garantizada
                            </span>
                          )}
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

      {/* Mock PIX payment Modal */}
      {activePixBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full rounded-2xl shadow-2xl p-6 relative overflow-hidden bg-zinc-950 border border-zinc-800">
            <button 
              onClick={() => setActivePixBooking(null)}
              className="absolute right-4 top-4 p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-4 pt-2">
              <div className="w-12 h-12 bg-cyan-950 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-850">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Pagamento Pix pendente</h3>
              <p className="text-sm text-zinc-455 max-w-xs mx-auto">
                Para confirmar sua vaga na aula em <strong className="text-white">{activePixBooking.class?.location || activePixBooking.class?.location}</strong>, realize o pagamento do Pix.
              </p>
              
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Valor da Aula:</span>
                  <strong className="text-white">R$ 85,00</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Agendamento ID:</span>
                  <strong className="text-white">#{activePixBooking.id}</strong>
                </div>
                
                {/* Mock QR code design */}
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 font-semibold mb-1 uppercase">Código Pix Copia e Cola:</p>
                  <textarea
                    readOnly
                    className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    value={`00020126580014BR.GOV.BCB.PIX0114surfconnectpix030485005802BR5911SurfConnect6009SaoPaulo62070503#${activePixBooking.id}`}
                    onClick={(e) => {
                      e.target.select();
                      document.execCommand('copy');
                      alert('Código Pix copiado para a área de transferência!');
                    }}
                  />
                  <span className="text-[10px] text-zinc-500 block mt-1 text-center font-medium">Clique dentro da caixa acima para copiar o código.</span>
                </div>
              </div>
              
              <div className="pt-2 text-xs text-zinc-500 italic">
                *Nota: Ao simular "Marcar Presença" na tela do Instrutor, o status de pagamento mudará automaticamente para PAGO!
              </div>

              <button
                onClick={() => setActivePixBooking(null)}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 cursor-pointer"
              >
                Concluído / Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
