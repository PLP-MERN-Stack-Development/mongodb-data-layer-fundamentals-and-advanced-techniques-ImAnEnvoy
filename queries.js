// Import MongoDB client
const { MongoClient } = require('mongodb');

// Connection URI (replace with your MongoDB connection string if using Atlas)
const uri = 'mongodb://localhost:27017';

// Database and collection names
const dbName = 'plp_bookstore';
const collectionName = 'books';

//---------------------------------------------------

async function main() {
  const client = new MongoClient(uri);

  // Connect to the MongoDB server
  await client.connect();
  console.log('Connected successfully to MongoDB server');

  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  
  try {
    // Query to FIND books published after a certain year
    const recentBooks = await collection.find({ published_year: { $gt: 1950 } }).toArray();
    console.log('Books published after 1950 are: ', recentBooks);
    
    // Query to FIND books by a specific author
    const authorBooks = await collection.find({ author: 'Herman Melville' }).toArray();
    console.log("Books by 'Herman Melville': ", authorBooks);

    // Query to UPDATE the price of a specific book
    await collection.updateOne({ title: 'Wuthering Heights' }, { $set: { price: 1000 } });
    console.log("Price of book updated");

    // Query to DELETE a book by its title
    await collection.deleteOne({ title: 'The Alchemist' });
    console.log("Book deleted");

    // --------------- TASK THREE ---------------
    
    // Find books that are in stock AND published after 2010
    const books_after_2010 = await collection.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log('Books in stock and published after 2010: ', books_after_2010)

    // Use projection to return only the title, author, and price fields in your queries
    const books_projection = await collection.find(
      { in_stock: true,
        published_year: { $gt: 2010 }
       }
    );

    // Use projection to return only the title, author, and price fields in your queries
    const book_projection = await collection.find(
      {},
      {
        projection: { title: 1, author: 1, price: 1, _id: 0 }
      }
    ).sort({ price: -1 }).toArray();
    console.log("Books sorted by price (descending):", booksDesc);
    
    // Aggregation pipeline: average price of books by genre
    const averagePrices = await collection.aggregate([
      { $group: { _id: "$genre", averagePrice: { $avg: "$price" } }}
    ]).toArray();

    // Aggregation pipeline: find the author with the most books
    const topAuthor = await collection.aggregate([
      { $group: { _id: "$author", bookCount: { $sum: 1 } } },
      { $sort: { bookCount: -1 } },
      { $limit: 1 }]
    ).toArray();
    console.log("Author with the most books:", topAuthor);

    // Task 5: Indexing

    // Create an index on the "title" field
    await collection.createIndex({ title: 1 });
    console.log("Index created on 'title'");

    // Create a compound index on "author" and "published_year"
    await collection.createIndex({ author: 1, published_year: -1 });
   console.log("Compound index created on 'author' and 'published_year'");

    // Demonstrate with explain()
    let result = await collection.find({ title: "Book A" }).explain("executionStats");
    console.log(JSON.stringify(result, null, 2));


  } catch (err) {
    console.error('Error: ', err);
  } finally {
    // close the connection 
    await client.close();
  console.log("MongoDB connection closed!");
  }
}

main();