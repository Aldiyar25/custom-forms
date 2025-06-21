import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import MDEditor from "@uiw/react-md-editor";
import CreatableSelect from "react-select/creatable";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/axios";

function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("PERSONAL");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  const [, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [questions, setQuestions] = useState([]);

  const QUESTION_LIMITS = {
    TEXT: 10,
    LONG_TEXT: 5,
    NUMBER: 5,
    CHECKBOX: 10,
  };

  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/templates/${id}`)
      .then(({ data }) => {
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
        setTheme(data.theme);
        setIsPublic(data.isPublic);
        setImageUrl(data.imageUrl || "");

        const sel = data.tags.map((t) => ({ label: t.name, value: t.name }));
        setSelectedTags(sel);
        const qs = data.questions
          .sort((a, b) => a.order - b.order)
          .map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options?.map((o) => o.text) || [],
          }));
        setQuestions(qs);
      })
      .catch((err) => setError("Error loading template", err));
  }, [id]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress(0);
      const { data } = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: ({ loaded, total }) => {
          setUploadProgress(Math.round((loaded / total) * 100));
        },
      });
      setImageUrl(data.url);
    } catch (err) {
      console.error("Error uploading image", err);
      setError("Error uploading image");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    api
      .get("/tags")
      .then(({ data }) => {
        const opts = data.map((name) => ({ label: name, value: name }));
        setTags(data);
        setTagOptions(opts);
      })
      .catch(console.error);
  }, []);

  const handleTagsChange = (newValue) => {
    setSelectedTags(newValue || []);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), text: "", type: "TEXT", options: [] },
    ]);
  };

  const updateQuestion = (index, q) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = q;
      return updated;
    });
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(questions);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        content,
        theme,
        isPublic,
        imageUrl,
        tags: selectedTags.map((t) => t.value),
        questions: questions.map((q, idx) => ({
          text: q.text,
          type: q.type,
          order: idx,
          options: q.type === "CHECKBOX" ? q.options : undefined,
        })),
      };
      if (id) {
        await api.put(`/templates/${id}`, payload);
      } else {
        await api.post("/templates", payload);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error saving template");
    }
  };

  if (id && title === "" && !error) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <h2>{id ? "Edit template" : "Create new template"}</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Image (optional)</Form.Label>
          <div
            {...getRootProps()}
            className={`border p-3 text-center ${
              isDragActive ? "bg-light" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag and drop an image here, or click to select one</p>
            )}
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              className="mt-2"
            />
          )}
          {imageUrl && (
            <div className="mt-3">
              <Image src={imageUrl} thumbnail style={{ maxHeight: 200 }} />
            </div>
          )}
        </Form.Group>

        <Button type="submit">Save</Button>

        <Form.Group className="mb-3">
          <Form.Label>Tags</Form.Label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={handleTagsChange}
            placeholder="Choose or create tags"
            formatCreateLabel={(inputValue) => `Create tag "${inputValue}"`}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Short description</Form.Label>
          <Form.Control
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Theme</Form.Label>
          <Form.Select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="PERSONAL">Personal</option>
            <option value="BUSINESS">Business</option>
            <option value="EDUCATION">Education</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <MDEditor value={content} onChange={setContent} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Questions</Form.Label>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {questions.map((q, idx) => (
                    <Draggable
                      key={q.id}
                      draggableId={String(q.id)}
                      index={idx}
                    >
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="border p-2 mb-2"
                        >
                          <div
                            {...drag.dragHandleProps}
                            style={{ cursor: "move" }}
                          >
                            Drag
                          </div>
                          <Form.Control
                            className="mb-2"
                            placeholder="Question text"
                            value={q.text}
                            onChange={(e) =>
                              updateQuestion(idx, {
                                ...q,
                                text: e.target.value,
                              })
                            }
                          />
                          <Form.Select
                            className="mb-2"
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              if (
                                newType !== q.type &&
                                questions.filter((qq) => qq.type === newType)
                                  .length >= QUESTION_LIMITS[newType]
                              )
                                return;
                              updateQuestion(idx, {
                                ...q,
                                type: newType,
                                options:
                                  newType === "CHECKBOX" ? q.options : [],
                              });
                            }}
                          >
                            <option value="TEXT">Short text</option>
                            <option value="LONG_TEXT">Long text</option>
                            <option value="NUMBER">Number</option>
                            <option value="CHECKBOX">Checkbox</option>
                          </Form.Select>
                          {q.type === "CHECKBOX" && (
                            <Form.Control
                              as="textarea"
                              rows={2}
                              className="mb-2"
                              placeholder="One option per line"
                              value={q.options.join("\n")}
                              onChange={(e) =>
                                updateQuestion(idx, {
                                  ...q,
                                  options: e.target.value
                                    .split("\n")
                                    .map((o) => o.trim())
                                    .filter(Boolean),
                                })
                              }
                            />
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeQuestion(idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button className="mt-2" onClick={addQuestion}>
            Add Question
          </Button>
        </Form.Group>

        <Form.Group className="mb-3 form-check">
          <Form.Check
            type="checkbox"
            label="Public template"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </Form.Group>

        <Button type="submit">
          {" "}
          {id ? "Save changes" : "Create template"}
        </Button>
      </Form>
    </Container>
  );
}

export default TemplateEditor;
