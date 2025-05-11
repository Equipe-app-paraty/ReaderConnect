import { users, books, userBooks, User, InsertUser, Book, UserBook, InsertBook, InsertUserBook, UpdateUserBook } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 304,
        description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
        rating: 4
      },
      {
        title: "Circe",
        author: "Madeline Miller",
        coverImage: "https://pixabay.com/get/g98bf17a781dabe8902a2dfeec0fe0eca55723fd648853784645f319419bb118577a7074f696443a2536e0da0af4dd805792c88a0a20dda67add64760153f1a38_1280.jpg",
        totalPages: 352,
        description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother.",
        rating: 5
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        coverImage: "https://pixabay.com/get/g56b6b7f0d4b5bf2c8cbfa1b8b338b5415ca16e5d87369a46a1c8b6d26c80688ca071ce302c8f54658e20a3cde71580025d86eb2908f71c706164b9e85813c3e2_1280.jpg",
        totalPages: 412,
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.",
        rating: 5
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        coverImage: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 352,
        description: "Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles.",
        rating: 4
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 197,
        description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
        rating: 4
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 496,
        description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.",
        rating: 5
      },
      {
        title: "The House in the Cerulean Sea",
        author: "TJ Klune",
        coverImage: "https://pixabay.com/get/gae7d35379a91d9e200c445e72b6938bb93b2a37a5f5598513cce7e772ac22c06ad5beb84eff314ffd7f986bdf2c9df3fb380786c21b8342ce03a87ef1e16bcb8_1280.jpg",
        totalPages: 396,
        description: "Linus Baker leads a quiet, solitary life. At forty, he lives in a tiny house with a devious cat and his old records.",
        rating: 5
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 320,
        description: "From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel that asks, what does it mean to love?",
        rating: 4
      },
      {
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        coverImage: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
        totalPages: 448,
        description: "A life no one will remember. A story you will never forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets.",
        rating: 4
      },
      {
        title: "The Night Circus",
        author: "Erin Morgenstern",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1200",
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

export const storage = new MemStorage();
