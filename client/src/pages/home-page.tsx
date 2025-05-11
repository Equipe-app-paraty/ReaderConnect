import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ReadingBookCard from "@/components/books/reading-book-card";
import BookCard from "@/components/books/book-card";
import RecommendedBookCard from "@/components/books/recommended-book-card";
import { Book, UserBook } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: currentlyReading, isLoading: isLoadingReading } = useQuery<(UserBook & { book: Book })[]>({
    queryKey: ["/api/user-books/reading"],
  });
  
  const { data: wantToRead, isLoading: isLoadingWantToRead } = useQuery<(UserBook & { book: Book })[]>({
    queryKey: ["/api/user-books/want_to_read"],
  });
  
  const { data: allBooks, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });
  
  // Get books that are not in user's lists as recommendations
  const recommendedBooks = allBooks?.filter(book => {
    const userBookIds = [...(currentlyReading || []), ...(wantToRead || [])].map(ub => ub.bookId);
    return !userBookIds.includes(book.id);
  }).slice(0, 3);
  
  // Placeholder stats - in a real app these would come from the backend
  const readingStats = {
    booksRead: 12,
    pagesRead: 3248,
    readingStreak: 24
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="md:flex">
          <Sidebar />
          
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-2xl font-serif font-bold text-primary-dark mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Reader'}!
              </h1>
              <p className="text-primary-light">Pick up where you left off</p>
            </div>
            
            {/* Currently reading section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold text-primary-dark">Currently Reading</h2>
                <a href="#" className="text-sm text-secondary hover:underline font-medium">View all</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingReading ? (
                  // Loading skeletons
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-card overflow-hidden">
                      <Skeleton className="h-64 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : currentlyReading && currentlyReading.length > 0 ? (
                  currentlyReading.map(userBook => (
                    <ReadingBookCard key={userBook.id} userBook={userBook} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-primary-light">You're not currently reading any books.</p>
                    <button className="mt-2 text-white bg-secondary hover:bg-secondary-light rounded-lg text-sm px-4 py-2 transition-colors">
                      Add a book to read
                    </button>
                  </div>
                )}
              </div>
            </section>
            
            {/* Want to read section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold text-primary-dark">Want to Read</h2>
                <a href="#" className="text-sm text-secondary hover:underline font-medium">View all</a>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {isLoadingWantToRead ? (
                  // Loading skeletons
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-card overflow-hidden">
                      <Skeleton className="aspect-[2/3] w-full" />
                      <div className="p-3 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : wantToRead && wantToRead.length > 0 ? (
                  wantToRead.map(userBook => (
                    <BookCard key={userBook.id} book={userBook.book} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-primary-light">You don't have any books in your want to read list yet.</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Reading Stats */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold text-primary-dark">Reading Stats</h2>
                <select className="text-sm border-none text-primary-dark bg-neutral-lightest rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>This Year</option>
                  <option>Last 6 Months</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-primary-light text-sm">Books Read</div>
                    <div className="bg-neutral-lightest p-1.5 rounded-full">
                      <i className="ri-book-read-line text-secondary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-medium text-primary-dark">{readingStats.booksRead}</div>
                  <div className="text-xs text-success mt-1 flex items-center">
                    <i className="ri-arrow-up-line mr-0.5"></i> 4 more than last year
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-primary-light text-sm">Pages Read</div>
                    <div className="bg-neutral-lightest p-1.5 rounded-full">
                      <i className="ri-file-list-3-line text-secondary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-medium text-primary-dark">{readingStats.pagesRead.toLocaleString()}</div>
                  <div className="text-xs text-success mt-1 flex items-center">
                    <i className="ri-arrow-up-line mr-0.5"></i> 872 more than last year
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-primary-light text-sm">Reading Streak</div>
                    <div className="bg-neutral-lightest p-1.5 rounded-full">
                      <i className="ri-fire-line text-secondary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-medium text-primary-dark">{readingStats.readingStreak} days</div>
                  <div className="text-xs text-success mt-1 flex items-center">
                    <i className="ri-arrow-up-line mr-0.5"></i> Your longest streak yet!
                  </div>
                </div>
              </div>
            </section>
            
            {/* Book recommendations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold text-primary-dark">Recommended for You</h2>
                <a href="#" className="text-sm text-secondary hover:underline font-medium">View all</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingBooks ? (
                  // Loading skeletons
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-card overflow-hidden">
                      <div className="p-4 flex">
                        <Skeleton className="w-24 h-36 flex-shrink-0 rounded" />
                        <div className="ml-4 flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-1/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                      <div className="border-t border-neutral-light px-4 py-3 flex justify-between">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    </div>
                  ))
                ) : recommendedBooks && recommendedBooks.length > 0 ? (
                  recommendedBooks.map(book => (
                    <RecommendedBookCard key={book.id} book={book} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-primary-light">We don't have any recommendations for you at the moment.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <MobileNav />
      <Footer />
    </div>
  );
}
