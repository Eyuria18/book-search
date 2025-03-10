
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { QUERY_ME } from '../utils/queries';
import { useQuery } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';
import { useMutation } from '@apollo/client';
import { Book } from '../models/Book';

const SavedBooks = () => {

  const [removeBook] = useMutation(REMOVE_BOOK);

  const { loading, data } = useQuery(QUERY_ME);
  const profile = data?.me || {};


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
            const { errors } = await removeBook({
              variables: { bookId },
            });
      
            if (errors) {
              throw new Error('Something went wrong!');
            }

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {profile.username ? (
            <h1>Viewing {profile.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {profile.savedBooks.length
            ? `Viewing ${profile.savedBooks.length} saved ${
                profile.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {profile.savedBooks.map((book: Book) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
