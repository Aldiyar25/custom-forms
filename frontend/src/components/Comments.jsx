import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

function Comments({ templateId, initialLikes = [] }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  const [liked, setLiked] = useState(
    user ? initialLikes.some((l) => l.userId === user.id) : false
  );

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/templates/${templateId}/comments`);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  }, [templateId]);

  useEffect(() => {
    fetchComments();
    const id = setInterval(fetchComments, 5000);
    return () => clearInterval(id);
  }, [fetchComments]);

  useEffect(() => {
    setLiked(user ? initialLikes.some((l) => l.userId === user.id) : false);
  }, [user, initialLikes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/templates/${templateId}/comments`, {
        text,
      });
      setComments((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const toggleLike = async () => {
    try {
      const { data } = await api.post(`/templates/${templateId}/like`);
      setLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-3">
        <Button
          variant={liked ? "primary" : "outline-primary"}
          onClick={toggleLike}
          disabled={!user}
        >
          {liked ? "Unlike" : "Like"} ({likeCount})
        </Button>
      </div>
      <h5>Comments</h5>
      <ListGroup className="mb-3">
        {comments.map((c) => (
          <ListGroup.Item key={c.id}>
            <strong>{c.author.username}:</strong> {c.text}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {user && (
        <Form onSubmit={handleSubmit} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <Button type="submit" className="ms-2">
            Post
          </Button>
        </Form>
      )}
    </div>
  );
}

export default Comments;
