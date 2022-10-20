import React, { useEffect, useState } from 'react';
import api from './utils/api';
import { v4 as uuid } from 'uuid';

const getTodos = async (setErrors) => {
  try {
    return await api.getTodos();
  } catch (e) {
    setErrors(`We tried to get your items but ${e.message}`);
  }
};

const addTodo = async (text, setErrors) => {
  try {
    const todo = {
      id: uuid(),
      completed: false,
      text,
    };
    const newTodo = await api.createTodo(todo);
    return { ...todo, id: newTodo.documentId };
  } catch (e) {
    setErrors(`We can't add this item but ${e.message}`);
  }
};

const deleteTodo = async (id, setErrors) => {
  try {
    const item = await api.deleteTodo(id);
    return item.documentId;
  } catch (e) {
    setErrors(`We can't delete this item but ${e.message}`);
  }
};

const updateTodo = async (todo, setErrors) => {
  try {
    const item = await api.updateTodo(todo);
    return item.documentId;
  } catch (e) {
    setErrors(`We can't update this item but ${e.message}`);
  }
};

const Todo = ({ todo, setErrors, onDelete, onUpdate }) => {
  return (
    <div>
      <button
        onClick={async () => {
          const id = await deleteTodo(todo.id, setErrors);
          onDelete && onDelete(id);
        }}
      >
        &times;
      </button>{' '}
      <label
        style={{
          textDecoration: `${todo.completed ? 'line-through' : ''}`,
        }}
      >
        <input
          type="checkbox"
          value={todo.id}
          onChange={async () => {
            const updatedTodo = {
              ...todo,
              ...{ completed: !todo.completed },
            };
            const id = await updateTodo(updatedTodo, setErrors);
            onUpdate && onUpdate(id, updatedTodo);
          }}
        />
        {todo.text}
      </label>
    </div>
  );
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [item, setItem] = useState('');
  const [errors, setErrors] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      setTodos(await getTodos(setErrors));
    };
    loadTodos();
  }, []);

  return (
    <>
      <input
        type="text"
        placeholder="Enter something to do"
        onChange={(e) => setItem(e.target.value)}
      />
      <button
        onClick={async () => {
          const todo = await addTodo(item, setErrors);
          setTodos([...todos, todo]);
        }}
      >
        Add
      </button>
      {errors && (
        <div style={{ color: 'red' }}>
          <strong>Something broke: </strong>
          {errors}
        </div>
      )}
      {todos && todos.length === 0 && <div>There is nothing to do.</div>}
      {todos &&
        todos.length > 0 &&
        todos.map((todo) => {
          return (
            <Todo
              key={todo.id}
              todo={todo}
              setErrors={setErrors}
              onDelete={(id) => setTodos(todos.filter((t) => t.id !== id))}
              onUpdate={(id, updatedTodo) =>
                setTodos(
                  todos.filter((t) => (t.id === id ? updatedTodo : todo)),
                )
              }
            />
          );
        })}
    </>
  );
};

export default App;
