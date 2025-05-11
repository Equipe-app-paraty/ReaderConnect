import { users, books, userBooks, User, InsertUser, Book, UserBook, InsertBook, InsertUserBook, UpdateUserBook } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getBook(id: number): Promise<Book | undefined>;
  getBooks(): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  
  // UserBook operations
  getUserBooks(userId: number): Promise<(UserBook & { book: Book })[]>;
  getUserBooksByStatus(userId: number, status: string): Promise<(UserBook & { book: Book })[]>;
  addUserBook(userBook: InsertUserBook): Promise<UserBook>;
  updateUserBook(id: number, userBook: UpdateUserBook): Promise<UserBook | undefined>;
  removeUserBook(id: number): Promise<void>;
  
  sessionStore: any; // Using any for now to avoid TypeScript error
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private booksMap: Map<number, Book>;
  private userBooksMap: Map<number, UserBook>;
  sessionStore: any; // Using any for now to avoid TypeScript error
  private nextUserId: number;
  private nextBookId: number;
  private nextUserBookId: number;

  constructor() {
    this.usersMap = new Map();
    this.booksMap = new Map();
    this.userBooksMap = new Map();
    this.nextUserId = 1;
    this.nextBookId = 1;
    this.nextUserBookId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Seed some initial books
    this.seedBooks();
  }

  private seedBooks() {
    const initialBooks = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        coverImage: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
        totalPages: 304,
        description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
        rating: 4
      },
      {
        title: "Circe",
        author: "Madeline Miller",
        coverImage: "https://m.media-amazon.com/images/I/514aBJBGJQL._SY445_SX342_.jpg",
        totalPages: 352,
        description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother.",
        rating: 5
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        coverImage: "https://m.media-amazon.com/images/I/41LmP3KL5LL._SY445_SX342_.jpg",
        totalPages: 412,
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.",
        rating: 5
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        coverImage: "https://m.media-amazon.com/images/I/71YOUdSGq1L._AC_UF1000,1000_QL80_.jpg",
        totalPages: 352,
        description: "Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles.",
        rating: 4
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        coverImage: "https://m.media-amazon.com/images/I/71zHDXu1TlL._AC_UF1000,1000_QL80_.jpg",
        totalPages: 197,
        description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
        rating: 4
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        coverImage: "https://m.media-amazon.com/images/I/91p5L3L3KQL._AC_UF1000,1000_QL80_.jpg",
        totalPages: 496,
        description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.",
        rating: 5
      },
      {
        title: "The House in the Cerulean Sea",
        author: "TJ Klune",
        coverImage: "https://m.media-amazon.com/images/I/91Vw9V3ZD+L._AC_UF1000,1000_QL80_.jpg",
        totalPages: 396,
        description: "Linus Baker leads a quiet, solitary life. At forty, he lives in a tiny house with a devious cat and his old records.",
        rating: 5
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        coverImage: "https://m.media-amazon.com/images/I/71PL7-0gu+L._AC_UF1000,1000_QL80_.jpg",
        totalPages: 320,
        description: "From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel that asks, what does it mean to love?",
        rating: 4
      },
      {
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        coverImage: "https://m.media-amazon.com/images/I/917r5puz43L._AC_UF1000,1000_QL80_.jpg",
        totalPages: 448,
        description: "A life no one will remember. A story you will never forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets.",
        rating: 4
      },
      {
        title: "The Night Circus",
        author: "Erin Morgenstern",
        coverImage: "https://m.media-amazon.com/images/I/91oc-oQsZDL._AC_UF1000,1000_QL80_.jpg",
        totalPages: 384,
        description: "The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not.",
        rating: 5
      }
    ];
    
    initialBooks.forEach(book => {
      const bookWithId = { ...book, id: this.nextBookId++ };
      this.booksMap.set(bookWithId.id, bookWithId);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const defaultProfilePicture = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100";
    const user: User = { 
      ...insertUser, 
      id,
      profilePicture: defaultProfilePicture
    };
    this.usersMap.set(id, user);
    return user;
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.booksMap.get(id);
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.booksMap.values());
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.nextBookId++;
    // Ensure description and rating are not undefined
    const newBook = { 
      ...book, 
      id,
      description: book.description || null,
      rating: book.rating || null
    } as Book;
    this.booksMap.set(id, newBook);
    return newBook;
  }

  async getUserBooks(userId: number): Promise<(UserBook & { book: Book })[]> {
    const userBooks = Array.from(this.userBooksMap.values()).filter(
      (userBook) => userBook.userId === userId
    );
    
    return userBooks.map(userBook => {
      const book = this.booksMap.get(userBook.bookId);
      if (!book) {
        throw new Error(`Book with id ${userBook.bookId} not found`);
      }
      return { ...userBook, book };
    });
  }

  async getUserBooksByStatus(userId: number, status: string): Promise<(UserBook & { book: Book })[]> {
    const userBooks = Array.from(this.userBooksMap.values()).filter(
      (userBook) => userBook.userId === userId && userBook.status === status
    );
    
    return userBooks.map(userBook => {
      const book = this.booksMap.get(userBook.bookId);
      if (!book) {
        throw new Error(`Book with id ${userBook.bookId} not found`);
      }
      return { ...userBook, book };
    });
  }

  async addUserBook(userBook: InsertUserBook): Promise<UserBook> {
    const id = this.nextUserBookId++;
    const now = new Date();
    const newUserBook: UserBook = { 
      ...userBook, 
      id, 
      currentPage: userBook.currentPage || 0,
      dateAdded: now, 
      dateCompleted: userBook.status === 'completed' ? now : null 
    };
    this.userBooksMap.set(id, newUserBook);
    return newUserBook;
  }

  async updateUserBook(id: number, updates: UpdateUserBook): Promise<UserBook | undefined> {
    const userBook = this.userBooksMap.get(id);
    if (!userBook) {
      return undefined;
    }
    
    const updatedUserBook: UserBook = { 
      ...userBook, 
      ...updates,
      dateCompleted: updates.status === 'completed' ? new Date() : userBook.dateCompleted
    };
    
    this.userBooksMap.set(id, updatedUserBook);
    return updatedUserBook;
  }

  async removeUserBook(id: number): Promise<void> {
    this.userBooksMap.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    // Seed books when database is empty
    this.seedBooksIfEmpty();
  }

  private async seedBooksIfEmpty() {
    // Check if there are any books in the database
    const existingBooks = await db.select().from(books).limit(1);
    if (existingBooks.length === 0) {
      // If no books exist, seed with initial data
      console.log("Seeding books into database...");
      const initialBooks = [
        {
          title: "The Midnight Library",
          author: "Matt Haig",
          coverImage: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
          totalPages: 304,
          description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
          rating: 4
        },
        {
          title: "Circe",
          author: "Madeline Miller",
          coverImage: "https://m.media-amazon.com/images/I/514aBJBGJQL._SY445_SX342_.jpg",
          totalPages: 352,
          description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother.",
          rating: 5
        },
        {
          title: "Dune",
          author: "Frank Herbert",
          coverImage: "https://m.media-amazon.com/images/I/41LmP3KL5LL._SY445_SX342_.jpg",
          totalPages: 412,
          description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.",
          rating: 5
        },
        {
          title: "The Song of Achilles",
          author: "Madeline Miller",
          coverImage: "https://m.media-amazon.com/images/I/71YOUdSGq1L._AC_UF1000,1000_QL80_.jpg",
          totalPages: 352,
          description: "Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles.",
          rating: 4
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          coverImage: "https://m.media-amazon.com/images/I/71zHDXu1TlL._AC_UF1000,1000_QL80_.jpg",
          totalPages: 197,
          description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
          rating: 4
        },
        {
          title: "Project Hail Mary",
          author: "Andy Weir",
          coverImage: "https://m.media-amazon.com/images/I/91p5L3L3KQL._AC_UF1000,1000_QL80_.jpg",
          totalPages: 496,
          description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.",
          rating: 5
        },
        {
          title: "The House in the Cerulean Sea",
          author: "TJ Klune",
          coverImage: "https://m.media-amazon.com/images/I/91Vw9V3ZD+L._AC_UF1000,1000_QL80_.jpg",
          totalPages: 396,
          description: "Linus Baker leads a quiet, solitary life. At forty, he lives in a tiny house with a devious cat and his old records.",
          rating: 5
        },
        {
          title: "Klara and the Sun",
          author: "Kazuo Ishiguro",
          coverImage: "https://m.media-amazon.com/images/I/71PL7-0gu+L._AC_UF1000,1000_QL80_.jpg",
          totalPages: 320,
          description: "From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel that asks, what does it mean to love?",
          rating: 4
        },
        {
          title: "The Invisible Life of Addie LaRue",
          author: "V.E. Schwab",
          coverImage: "https://m.media-amazon.com/images/I/917r5puz43L._AC_UF1000,1000_QL80_.jpg",
          totalPages: 448,
          description: "A life no one will remember. A story you will never forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets.",
          rating: 4
        },
        {
          title: "The Night Circus",
          author: "Erin Morgenstern",
          coverImage: "https://m.media-amazon.com/images/I/91oc-oQsZDL._AC_UF1000,1000_QL80_.jpg",
          totalPages: 384,
          description: "The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not.",
          rating: 5
        }
      ];
      
      // Insert all books into the database
      await db.insert(books).values(initialBooks);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const defaultProfilePicture = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100";
    const [user] = await db.insert(users)
      .values({ 
        ...insertUser, 
        profilePicture: defaultProfilePicture 
      })
      .returning();
    return user;
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async getBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books)
      .values({
        ...book,
        description: book.description || null,
        rating: book.rating || null
      })
      .returning();
    return newBook;
  }

  async getUserBooks(userId: number): Promise<(UserBook & { book: Book })[]> {
    const result = await db.select({
      userBook: userBooks,
      book: books
    })
    .from(userBooks)
    .innerJoin(books, eq(userBooks.bookId, books.id))
    .where(eq(userBooks.userId, userId));

    return result.map(r => ({
      ...r.userBook,
      book: r.book
    }));
  }

  async getUserBooksByStatus(userId: number, status: string): Promise<(UserBook & { book: Book })[]> {
    const result = await db.select({
      userBook: userBooks,
      book: books
    })
    .from(userBooks)
    .innerJoin(books, eq(userBooks.bookId, books.id))
    .where(and(
      eq(userBooks.userId, userId),
      eq(userBooks.status, status)
    ));

    return result.map(r => ({
      ...r.userBook,
      book: r.book
    }));
  }

  async addUserBook(userBook: InsertUserBook): Promise<UserBook> {
    const now = new Date();
    const [newUserBook] = await db.insert(userBooks)
      .values({
        ...userBook,
        currentPage: userBook.currentPage || 0,
        dateAdded: now,
        dateCompleted: userBook.status === 'completed' ? now : null
      })
      .returning();
    
    return newUserBook;
  }

  async updateUserBook(id: number, updates: UpdateUserBook): Promise<UserBook | undefined> {
    // First check if the userBook exists
    const [existingUserBook] = await db.select().from(userBooks).where(eq(userBooks.id, id));
    
    if (!existingUserBook) {
      return undefined;
    }
    
    // Prepare update data
    const updateData: Partial<UserBook> = {
      ...updates
    };
    
    // Set dateCompleted if status is changing to 'completed'
    if (updates.status === 'completed' && existingUserBook.status !== 'completed') {
      updateData.dateCompleted = new Date();
    }
    
    // Update and return
    const [updatedUserBook] = await db
      .update(userBooks)
      .set(updateData)
      .where(eq(userBooks.id, id))
      .returning();
    
    return updatedUserBook;
  }

  async removeUserBook(id: number): Promise<void> {
    await db.delete(userBooks).where(eq(userBooks.id, id));
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
