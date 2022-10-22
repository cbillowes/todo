import React, { useEffect, useState, useRef } from 'react';
import api from './utils/api';
import { v4 as uuid } from 'uuid';
import './styles.css';

const getTodos = async (setErrors) => {
  try {
    const todos = await api.getTodos();
    return todos.sort((x, y) => y.created - x.created);
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
    return { ...todo, id: newTodo.documentId, created: newTodo.created };
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
    return {
      id: item.documentId,
      ...item,
    };
  } catch (e) {
    setErrors(`We can't update this item but ${e.message}`);
  }
};

const Todo = ({ todo, setErrors, toggleBusy, onDelete, onUpdate }) => {
  const dtFormat = new Intl.DateTimeFormat('en-MU', {
    timeZone: 'UTC',
    weekday: 'short',
    year: '2-digit',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const created = dtFormat.format(new Date(todo.created));
  const modified = todo.modified && dtFormat.format(new Date(todo.modified));
  return (
    <div className="flex items-center text-2xl py-6 px-4 bg-slate-800 border-slate-900 border my-1">
      <button
        aria-label="Delete item"
        className="mr-2 hover:text-red-500"
        onClick={async () => {
          toggleBusy(true);
          const id = await deleteTodo(todo.id, setErrors);
          onDelete && onDelete(id);
          toggleBusy(false);
        }}
      >
        &times;
      </button>{' '}
      <label
        aria-label={todo.text}
        className="flex items-center cursor-pointer w-full"
      >
        <input
          type="checkbox"
          value={todo.id}
          checked={todo.completed}
          onChange={async () => {
            toggleBusy(true);
            const toggled = await updateTodo(
              {
                ...todo,
                ...{ completed: !todo.completed },
              },
              setErrors,
            );
            onUpdate && onUpdate(toggled);
            toggleBusy(false);
          }}
          className="w-8 h-8 mr-2 text-green-500 focus:ring-green-400 focus:ring-opacity-25 border border-gray-300 rounded cursor-pointer"
        />
        <div className="flex justify-between w-full items-center">
          <span
            className={`${todo.completed ? 'line-through text-slate-700' : ''}`}
          >
            {todo.text}
          </span>
          <span className="text-xs text-right leading-loose">
            {created && <div>Created on {created}</div>}
            {modified && (
              <div className="text-slate-700">Changed on {modified}</div>
            )}
          </span>
        </div>
      </label>
    </div>
  );
};

const App = () => {
  const [isBusy, toggleBusy] = useState(false);
  const [todos, setTodos] = useState([]);
  const [item, setItem] = useState('');
  const [errors, setErrors] = useState('');
  const form = useRef();
  const textbox = useRef();

  const pushToTodos = (todos) => {
    setTodos(todos.sort((x, y) => y.created - x.created));
  };

  useEffect(() => {
    toggleBusy(true);
    const loadTodos = async () => {
      pushToTodos(await getTodos(setErrors));
      toggleBusy(false);
    };
    loadTodos();
  }, []);

  return (
    <div className="bg-slate-700 text-white min-h-screen px-4">
      <div className="mx-auto py-8 max-w-4xl">
        <h1 className="uppercase font-bold text-slate-300 mb-1">
          ✅ My awesome TO-DO list
        </h1>
        <form
          ref={form}
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            textbox.current.value = '';
          }}
        >
          <input
            ref={textbox}
            aria-label="Enter a TO-DO task here"
            type="text"
            placeholder="What to do?"
            onChange={(e) => setItem(e.target.value)}
            className="bg-slate-900 text-white w-full py-6 px-4 text-5xl shadow-lg border-none truncate"
          />
          <button
            className="bg-green-800 text-white w-56 text-5xl shadow-lg"
            onClick={async () => {
              toggleBusy(true);
              const todo = await addTodo(item, setErrors);
              pushToTodos([...todos, todo]);
              toggleBusy(false);
            }}
          >
            Add
          </button>
        </form>
        {isBusy && (
          <div className="my-8 text-center">
            <div role="status">
              <svg
                className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
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
                toggleBusy={toggleBusy}
                onDelete={(id) => pushToTodos(todos.filter((t) => t.id !== id))}
                onUpdate={(toggled) =>
                  pushToTodos(
                    todos.map((t) => {
                      return t.id === toggled.id ? toggled : t;
                    }),
                  )
                }
              />
            );
          })}
      </div>
    </div>
  );
};

export default App;
