import React, { useEffect, useState } from 'react';
import api from './utils/api';
import { v4 as uuid } from 'uuid';
import './styles.css';

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
    <div className="flex items-center text-2xl py-4 px-4 bg-slate-800 border-slate-900 border my-1">
      <button
        className="mr-2 hover:text-red-500"
        onClick={async () => {
          const id = await deleteTodo(todo.id, setErrors);
          onDelete && onDelete(id);
        }}
      >
        &times;
      </button>{' '}
      <label
        className="flex items-center cursor-pointer"
        style={{
          textDecoration: `${todo.completed ? 'line-through' : ''}`,
        }}
      >
        <input
          type="checkbox"
          value={todo.id}
          checked={todo.completed}
          onChange={async () => {
            const updatedTodo = {
              ...todo,
              ...{ completed: !todo.completed },
            };
            const id = await updateTodo(updatedTodo, setErrors);
            onUpdate && onUpdate(id, updatedTodo);
          }}
          className="w-8 h-8 mr-2 text-green-500 focus:ring-green-400 focus:ring-opacity-25 border border-gray-300 rounded cursor-pointer"
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
    <div className="bg-slate-700 text-white min-h-screen">
      <div className="mx-auto py-8 max-w-4xl">
        <h1 className="uppercase font-bold text-slate-300 mb-1">✅ My awesome TODO list</h1>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter something to do"
            onChange={(e) => setItem(e.target.value)}
            className="bg-slate-900 text-white w-full py-2 px-4 text-5xl shadow-lg border-none"
          />
          <button
            className="bg-green-800 text-white w-56 text-5xl shadow-lg"
            onClick={async () => {
              const todo = await addTodo(item, setErrors);
              setTodos([...todos, todo]);
            }}
          >
            Add
          </button>
        </div>
        {errors && (
          <div className="bg-red-700 text-red-200 py-2 text-center mb-6">
            <strong className="font-bold">Something broke: </strong>
            {errors}
          </div>
        )}
        {todos && todos.length === 0 && (
          <div className="py-6 px-4 text-slate-300">
            There is nothing to do right now. Add something to do ☝️.
          </div>
        )}
        {/* https://play.tailwindcss.com/TvjY5NyGgv */}
        {todos?.length > 0 &&
          todos.map((todo) => {
            return (
              <Todo
                key={todo.id}
                todo={todo}
                setErrors={setErrors}
                onDelete={(id) => setTodos(todos.filter((t) => t.id !== id))}
                onUpdate={(id, updatedTodo) =>
                  setTodos(todos.map((t) => (t.id === id ? updatedTodo : todo)))
                }
              />
            );
          })}
      </div>
    </div>
  );
};

export default App;
