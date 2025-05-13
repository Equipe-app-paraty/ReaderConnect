import { prisma } from "./lib/prisma.js";
async function main() {
  try {
    // Teste: criar um usuário
    const user = await prisma.user.create({
      data: {
        username: "testuser",
        password: "securepassword", // Em produção, você deve hashear a senha
        name: "Test User",
        email: "test@example.com",
      },
    });
    console.log("Usuário criado:", user);
    // Contar usuários
    const userCount = await prisma.user.count();
    console.log(`Total de usuários: ${userCount}`);
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
