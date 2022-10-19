import React, { useEffect, useState } from 'react';
import api from './utils/api';
import { v4 as uuid } from 'uuid';

const getTodos = async () => {
  return await api.getTodos();
};

const addTodo = async (text) => {
  const todo = await api.createTodo({
    id: uuid(),
    completed: false,
    text,
  });

  return {
    id: todo.documentId,
    completed: false,
    text,
  };
};

const deleteTodo = async (id) => {
  const item = await api.deleteTodo(id);
  return item.documentId;
};

const updateTodo = async (todo) => {
  const item = await api.updateTodo(todo);
  return item.documentId;
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [item, setItem] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      setTodos(await getTodos());
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
          const todo = await addTodo(item);
          setTodos([...todos, todo]);
        }}
      >
        Add
      </button>
      {todos.length === 0 && <div>There is nothing to do.</div>}
      {todos.length > 0 &&
        todos.map((todo) => {
          return (
            <div key={todo.id}>
              <button
                onClick={async () => {
                  const id = await deleteTodo(todo.id);
                  setTodos(todos.filter((todo) => todo.id !== id));
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
                    const update = {
                      ...todo,
                      ...{ completed: !todo.completed },
                    };
                    const id = await updateTodo(update);
                    setTodos(
                      todos.map((todo) => (todo.id === id ? update : todo)),
                    );
                  }}
                />
                {todo.text}
              </label>
            </div>
          );
        })}
    </>
  );
};

export default App;
