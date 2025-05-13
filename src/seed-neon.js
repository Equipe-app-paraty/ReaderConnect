// Use dotenv para carregar a URL do Neon do arquivo .env.production
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Certifique-se de que está usando a URL do Neon
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.includes('neon.tech')) {
  console.error('Please provide a valid Neon database URL');
  process.exit(1);
}

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Seed de usuários
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'securepassword', // Em produção, você deve hashear a senha
        name: 'Administrator',
        email: 'admin@example.com'
      }
    });
    
    console.log('Usuário criado:', user);
    
    // Seed de livros
    const books = [
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        coverImage: 'https://example.com/dom-casmurro.jpg',
        totalPages: 256,
        description: 'Um clássico da literatura brasileira sobre ciúme e dúvida.',
        rating: 5
      },
      {
        title: '1984',
        author: 'George Orwell',
        coverImage: 'https://example.com/1984.jpg',
        totalPages: 328,
        description: 'Uma distopia sobre vigilância e controle totalitário.',
        rating: 5
      }
    ];
    
    for (const book of books) {
      await prisma.book.create({ data: book });
    }
    
    console.log('Livros adicionados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao fazer seed do banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
