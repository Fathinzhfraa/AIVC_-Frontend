import database from "./database";

const STORAGE_KEY = "app_users";

function seed() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database.users));
}

seed();

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function findUser(username, password) {
  return getUsers().find(
    (u) => u.username === username && u.password === password
  );
}

export function usernameExists(username) {
  return getUsers().some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

export function addUser({ username, password, name, email }) {
  const users = getUsers();
  const newUser = {
    id: "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    username,
    password,
    name: name || username,
    email: email || "",
    role: "user",
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);

  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  }).catch(() => {
    /* offline: cukup di localStorage */
  });

  return newUser;
}
