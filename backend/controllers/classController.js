import prisma from '../prisma/client.js';

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

/**
 * Create a new class (ADMIN only)
 */
export const createClass = async (req, res) => {
  try {
    const { datetime, location, maxStudents, instructorId } = req.body;

    if (!datetime || !location || !maxStudents || !instructorId) {
      return res.status(400).json({ message: 'Todos os campos da aula são obrigatórios.' });
    }

    // Verify instructor role
    const instructor = await prisma.user.findUnique({
      where: { id: parseInt(instructorId) }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      return res.status(400).json({ message: 'O ID informado não pertence a um instrutor cadastrado.' });
    }

    const newClass = await prisma.class.create({
      data: {
        datetime: new Date(datetime),
        location,
        maxStudents: parseInt(maxStudents),
        instructorId: parseInt(instructorId)
      },
      include: {
        instructor: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Aula criada com sucesso!',
      class: newClass
    });

  } catch (error) {
    console.error('Erro ao criar aula:', error);
    return res.status(500).json({ message: 'Erro interno ao criar aula.' });
  }
};

/**
 * List all classes (ADMIN)
 */
export const listAllClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        instructor: {
          select: { id: true, name: true, email: true, telefone: true }
        },
        bookings: {
          where: { status: 'CONFIRMED' }
        }
      },
      orderBy: {
        datetime: 'asc'
      }
    });
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    return res.status(500).json({ message: 'Erro interno ao listar aulas.' });
  }
};

/**
 * List all bookings (ADMIN)
 */
export const listAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        student: {
          select: { id: true, name: true, email: true, telefone: true }
        },
        class: {
          include: {
            instructor: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return res.status(500).json({ message: 'Erro interno ao listar agendamentos.' });
  }
};

/**
 * List all instructors (ADMIN utility)
 */
export const listInstructors = async (req, res) => {
  try {
    const instructors = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: { id: true, name: true, email: true, telefone: true }
    });
    return res.status(200).json(instructors);
  } catch (error) {
    console.error('Erro ao obter instrutores:', error);
    return res.status(500).json({ message: 'Erro interno ao obter instrutores.' });
  }
};

/**
 * Get Admin dashboard metrics (ADMIN)
 */
export const getAdminMetrics = async (req, res) => {
  try {
    // 1. Total students
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    // 2. Classes today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const classesToday = await prisma.class.count({
      where: {
        datetime: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // 3. Simulated earnings (e.g. R$ 80 per confirmed booking, paid or pending)
    const totalBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' }
    });
    const totalEarnings = totalBookings * 85.00; // Flat R$ 85 per class booking

    return res.status(200).json({
      totalStudents,
      classesToday,
      totalEarnings
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar métricas.' });
  }
};


// ==========================================
// INSTRUCTOR ENDPOINTS
// ==========================================

/**
 * List instructor's own classes and enrolled students (INSTRUCTOR)
 */
export const listInstructorClasses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const classes = await prisma.class.findMany({
      where: { instructorId },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            student: {
              select: { id: true, name: true, email: true, telefone: true }
            }
          }
        }
      },
      orderBy: {
        datetime: 'asc'
      }
    });

    return res.status(200).json(classes);
  } catch (error) {
    console.error('Erro ao buscar aulas do instrutor:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar aulas.' });
  }
};

/**
 * Simulates marking attendance for a student (INSTRUCTOR)
 */
export const markAttendance = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'ID de agendamento não fornecido.' });
    }

    // Simulating changing payment status to PAID when marking attendance, or just logging.
    // Let's toggle paymentStatus to PAID as part of attendance flow!
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { paymentStatus: 'PAID' },
      include: {
        student: true,
        class: true
      }
    });

    console.log(`\n=== [SURFCONNECT PRESENÇA MOCK] ===`);
    console.log(`[Presença] Instrutor (ID: ${req.user.id}, Nome: ${req.user.name}) marcou PRESENÇA.`);
    console.log(`[Presença] Aluno: ${updatedBooking.student.name} | Aula: ${updatedBooking.class.location}`);
    console.log(`[Pagamento] Alterado status de pagamento para PAID.`);
    console.log(`==================================\n`);

    return res.status(200).json({
      message: `Presença confirmada para ${updatedBooking.student.name}!`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Erro ao marcar presença:', error);
    return res.status(500).json({ message: 'Erro interno ao marcar presença.' });
  }
};


// ==========================================
// STUDENT ENDPOINTS
// ==========================================

/**
 * List available classes for school (STUDENT)
 */
export const listAvailableClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        instructor: {
          select: { name: true }
        },
        bookings: {
          where: { status: 'CONFIRMED' }
        }
      },
      orderBy: {
        datetime: 'asc'
      }
    });

    // Add calculations (e.g. slots remaining)
    const enrichedClasses = classes.map(c => {
      const bookedCount = c.bookings.length;
      return {
        id: c.id,
        datetime: c.datetime,
        location: c.location,
        maxStudents: c.maxStudents,
        slotsLeft: c.maxStudents - bookedCount,
        instructorName: c.instructor.name
      };
    });

    return res.status(200).json(enrichedClasses);
  } catch (error) {
    console.error('Erro ao listar aulas disponíveis:', error);
    return res.status(500).json({ message: 'Erro interno ao carregar aulas.' });
  }
};

/**
 * Student creates a booking (STUDENT)
 */
export const createBooking = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'ID da aula é obrigatório.' });
    }

    // 1. Check if class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' }
        }
      }
    });

    if (!targetClass) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // 2. Check slots availability
    const bookedCount = targetClass.bookings.length;
    if (bookedCount >= targetClass.maxStudents) {
      return res.status(400).json({ message: 'Desculpe, esta aula já atingiu o limite de vagas.' });
    }

    // 3. Check if student already booked this class
    const alreadyBooked = await prisma.booking.findFirst({
      where: {
        studentId,
        classId: parseInt(classId),
        status: 'CONFIRMED'
      }
    });

    if (alreadyBooked) {
      return res.status(400).json({ message: 'Você já está agendado para esta aula.' });
    }

    // 4. Create the booking
    const booking = await prisma.booking.create({
      data: {
        studentId,
        classId: parseInt(classId),
        status: 'CONFIRMED',
        paymentStatus: 'PENDING'
      },
      include: {
        student: true,
        class: true
      }
    });

    // 5. Mock external integrations (WhatsApp & Payment Gateway)
    console.log(`\n=== [SURFCONNECT MOCK INTEGRATIONS] ===`);
    console.log(`[WhatsApp API] Notificação enviada para: ${booking.student.telefone}`);
    console.log(`[WhatsApp API] Mensagem: "Fala ${booking.student.name}! Seu agendamento para a aula de surf em '${booking.class.location}' no dia ${booking.class.datetime.toLocaleDateString('pt-BR')} foi realizado com sucesso. Aguardamos o pagamento do Pix."`);
    console.log(`[Gateway de Pagamento] Solicitando PIX no valor de R$ 85,00.`);
    console.log(`[Gateway de Pagamento] Código Copia e Cola gerado para o agendamento #${booking.id}: 00020126580014BR.GOV.BCB.PIX0114surfconnectpix030485005802BR5911SurfConnect6009SaoPaulo62070503#${booking.id}`);
    console.log(`========================================\n`);

    return res.status(201).json({
      message: 'Agendamento realizado com sucesso!',
      booking
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno ao realizar agendamento.' });
  }
};

/**
 * List student's own booking history (STUDENT)
 */
export const listStudentBookings = async (req, res) => {
  try {
    const studentId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            instructor: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Erro ao listar agendamentos do aluno:', error);
    return res.status(500).json({ message: 'Erro interno ao carregar histórico.' });
  }
};


// ==========================================
// MOCK SERVICES
// ==========================================

/**
 * Mock weather endpoint
 */
export const getWeather = async (req, res) => {
  try {
    // Simulated weather conditions for surfing
    const weatherData = {
      location: "Praia da Joaquina, SC",
      waves: "1.5m a 2.0m",
      wind: "5kt Terral (Quadrante Oeste)",
      condition: "Excelente",
      waterTemp: "20°C",
      crowd: "Baixo",
      summary: "Dia clássico! Ondas com boa formação, perfeitas para manobras. Vento terral limpando o mar. Condição ideal para todos os níveis."
    };
    return res.status(200).json(weatherData);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar clima.' });
  }
};
