import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Register a new user (ADMIN, INSTRUCTOR, or STUDENT)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, telefone } = req.body;

    // Validation
    if (!name || !email || !password || !role || !telefone) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const validRoles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Função de usuário (role) inválida.' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        telefone
      }
    });

    // Return created user (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
};

/**
 * Log in a user and issue a JWT token
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Generate JWT Token (payload: id, name, role)
    const secret = process.env.JWT_SECRET || 'surfconnect_super_secret_jwt_key_12345';
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      secret,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    // Return token and basic user info
    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        telefone: user.telefone
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
};
