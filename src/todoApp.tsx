import { useCallback, useEffect, useState } from "@lynx-js/react";
import lynxLogo from "./assets/lynx-logo.png";

// --- Types for Authentication ---
type User = {
  username: string;
  password: string;
};

type AuthState = {
  isAuthenticated: boolean;
  currentUser: string | null;
};

// --- Storage Helpers ---
// (Assumes that NativeModules.NativeLocalStorageModule is available in your Lynx environment)
const saveData = (key: string, data: any) => {
  try {
    NativeModules.NativeLocalStorageModule.setStorageItem(
      key,
      JSON.stringify(data)
    );
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

const loadData = (key: string) => {
  try {
    const dataString =
      NativeModules.NativeLocalStorageModule.getStorageItem(key);
    return dataString ? JSON.parse(dataString) : null;
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
};

export function TodoApp() {
  // --- Authentication State ---
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loginView, setLoginView] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- Todo App State ---
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [completedTodos, setCompletedTodos] = useState<number[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // --- Navigation and Menu ---
  const [currentView, setCurrentView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Load Authentication Data on Mount ---
  useEffect(() => {
    const savedAuthState = loadData("lynx-auth-state");
    const savedUsers = loadData("lynx-users");
    if (savedAuthState) {
      setAuthState(savedAuthState);
    }
    if (savedUsers) {
      setUsers(savedUsers);
    } else {
      // Initialize with a demo user
      setUsers([{ username: "demo", password: "demo123" }]);
    }
  }, []);

  // --- Persist Auth State and Users ---
  useEffect(() => {
    saveData("lynx-auth-state", authState);
    saveData("lynx-users", users);
  }, [authState, users]);

  // --- Load Todos for the Authenticated User ---
  useEffect(() => {
    if (authState.isAuthenticated && authState.currentUser) {
      const userKey = `lynx-todos-${authState.currentUser}`;
      const completedKey = `lynx-completed-todos-${authState.currentUser}`;
      const savedTodos = loadData(userKey);
      const savedCompletedTodos = loadData(completedKey);
      if (savedTodos) {
        setTodos(savedTodos);
      } else {
        setTodos(["Learn Lynx Basics", "Build First App", "Deploy to Store"]);
      }
      if (savedCompletedTodos) {
        setCompletedTodos(savedCompletedTodos);
      }
      console.info("Todo App Initialized for user:", authState.currentUser);
    }
  }, [authState.isAuthenticated, authState.currentUser]);

  // --- Persist Todos Changes ---
  useEffect(() => {
    if (authState.isAuthenticated && authState.currentUser) {
      const userKey = `lynx-todos-${authState.currentUser}`;
      const completedKey = `lynx-completed-todos-${authState.currentUser}`;
      saveData(userKey, todos);
      saveData(completedKey, completedTodos);
    }
  }, [todos, completedTodos, authState]);

  // --- Authentication Functions ---
  const handleLogin = useCallback(() => {
    "background only";
    setErrorMessage("");
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password");
      return;
    }
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setAuthState({ isAuthenticated: true, currentUser: username });
      setUsername("");
      setPassword("");
    } else {
      setErrorMessage("Invalid username or password");
    }
  }, [username, password, users]);

  const handleSignup = useCallback(() => {
    "background only";
    setErrorMessage("");
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password");
      return;
    }
    if (users.some((u) => u.username === username)) {
      setErrorMessage("Username already exists");
      return;
    }
    const newUsers = [...users, { username, password }];
    setUsers(newUsers);
    setAuthState({ isAuthenticated: true, currentUser: username });
    setUsername("");
    setPassword("");
  }, [username, password, users]);

  const handleLogout = useCallback(() => {
    "background only";
    setAuthState({ isAuthenticated: false, currentUser: null });
    setCurrentView("home");
  }, []);

  const toggleLoginView = useCallback(() => {
    "background only";
    setLoginView(loginView === "login" ? "signup" : "login");
    setErrorMessage("");
  }, [loginView]);

  // --- Todo Functions ---
  const handleAddTodo = useCallback(() => {
    "background only";
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo("");
    }
  }, [newTodo, todos]);

  const handleDeleteTodo = useCallback(
    (index: number) => {
      "background only";
      setTodos(todos.filter((_, i) => i !== index));
    },
    [todos]
  );

  const handleEditStart = useCallback(
    (index: number) => {
      "background only";
      console.log("Starting edit for index:", index);
      setEditIndex(index);
      setEditValue(todos[index]);
    },
    [todos]
  );

  const handleEditSave = useCallback(() => {
    "background only";
    console.log("Saving edit, index:", editIndex, "value:", editValue);
    if (editIndex !== null && editValue.trim()) {
      const newTodos = [...todos];
      newTodos[editIndex] = editValue.trim();
      setTodos(newTodos);
      setEditIndex(null);
    }
  }, [editIndex, editValue, todos]);

  const toggleComplete = useCallback(
    (index: number) => {
      "background only";
      if (completedTodos.includes(index)) {
        setCompletedTodos(completedTodos.filter((i) => i !== index));
      } else {
        setCompletedTodos([...completedTodos, index]);
      }
    },
    [completedTodos]
  );

  // --- Navigation and Menu Functions ---
  const navigateTo = useCallback((view: string) => {
    "background only";
    setCurrentView(view);
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    "background only";
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  return (
    <view className="flex flex-col min-h-screen bg-[#fafafa] relative">
      {/* Navigation Bar */}
      <view className="flex justify-between items-center px-4 py-3 bg-[#000000]">
        <view className="flex items-center ">
          <image
            src={lynxLogo}
            className="w-10 h-10 mr-[10px] bg-[#000000] rounded-full p-1"
          />
          <text className="text-2xl font-semibold  text-white">Lynx Todos</text>
        </view>
        <view className="flex items-center gap-4">
          <text className="text-base">{authState.currentUser}</text>
          <view className="cursor-pointer p-2" bindtap={toggleMenu}>
            <view className="flex flex-col justify-between w-6 h-[18px]">
              <view
                className={`w-full h-0.5 bg-white transition-transform ${
                  menuOpen ? "transform translate-y-2 rotate-45" : ""
                }`}
              ></view>
              <view
                className={`w-full h-0.5 bg-white transition-opacity ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></view>
              <view
                className={`w-full h-0.5 bg-white transition-transform ${
                  menuOpen ? "transform -translate-y-2 -rotate-45" : ""
                }`}
              ></view>
            </view>
          </view>
        </view>
      </view>
  
      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <view className="bg-white rounded-b-lg shadow absolute top-16 right-4 z-50 w-52">
          <view
            className={`px-4 py-3 border-b border-gray-200 ${
              currentView === "home" ? "bg-[#F5F5F5]" : ""
            }`}
            bindtap={() => navigateTo("home")}
          >
            <text className="text-base">Tasks</text>
          </view>
          <view
            className={`px-4 py-3 border-b border-gray-200 ${
              currentView === "about" ? "bg-[#F5F5F5]" : ""
            }`}
            bindtap={() => navigateTo("about")}
          >
            <text className="text-base">About</text>
          </view>
          <view
            className="px-4 py-3 border-b border-gray-200 text-[#E74C3C]"
            bindtap={handleLogout}
          >
            <text className="text-base">Logout</text>
          </view>
        </view>
      )}
  
      {/* Main Content */}
      {currentView === "home" && (
        <view className="flex-1 p-4">
          {/* Todo Input Section */}
          <view className="flex gap-3 p-4 bg-white rounded-lg m-4 shadow">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-lg text-base text-[#333333] bg-white"
              value={newTodo}
              // @ts-ignore
              bindinput={(e) => setNewTodo(e.detail.value)}
              placeholder="Enter new todo"
            />
            <text
              className="px-4 py-3 bg-[#4c8caf] text-white rounded-lg font-bold cursor-pointer"
              bindtap={handleAddTodo}
            >
              Add Todo
            </text>
          </view>
  
          {/* Todo List */}
          <view className="flex flex-col gap-3 mx-4">
            {todos.map((todo, index) => (
              <view
                key={index}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
              >
                {editIndex === index ? (
                  <view className="flex items-center gap-2">
                    <input
                      className="p-2 border border-gray-300 rounded-lg text-base"
                      value={editValue}
                      // @ts-ignore
                      bindinput={(e) => setEditValue(e.detail.value)}
                      style={{ width: "250px" }}
                      autofocus={true}
                    />
                    <text
                      className="px-4 py-2 bg-[#4CAF50] text-white rounded cursor-pointer"
                      bindtap={handleEditSave}
                    >
                      ✓
                    </text>
                  </view>
                ) : (
                  <>
                    <view className="flex items-center gap-3">
                      <view
                        className="cursor-pointer flex justify-center items-center w-5 h-5 border border-gray-400 rounded-full"
                        bindtap={() => toggleComplete(index)}
                        style={{
                          backgroundColor: completedTodos.includes(index)
                            ? "#4CAF50"
                            : "transparent",
                        }}
                      >
                        {completedTodos.includes(index) && (
                          <text className="text-white text-[14px]">✓</text>
                        )}
                      </view>
                      <text
                        className={`text-base ${
                          completedTodos.includes(index)
                            ? "line-through text-gray-500"
                            : "text-[#000]"
                        }`}
                        bindtap={() => handleEditStart(index)}
                      >
                        {todo}
                      </text>
                    </view>
                    <text
                      className="text-[#E74C3C] text-2xl font-light cursor-pointer"
                      bindtap={() => handleDeleteTodo(index)}
                    >
                      ×
                    </text>
                  </>
                )}
              </view>
            ))}
          </view>
        </view>
      )}
  
      {currentView === "about" && (
        <view className="flex-1 p-4">
          <view className="p-4 bg-white rounded-lg shadow m-4">
            <text className="text-2xl font-semibold mb-2">About Lynx Todos</text>
            <text className="text-base text-[#333333] mb-4">
              This is a beautifully designed Todo application built with the Lynx
              framework. It demonstrates basic CRUD operations, local storage
              persistence, and responsive navigation.
            </text>
            <view className="p-4 bg-[#F5F5F5] rounded-lg">
              <text className="text-lg font-semibold mb-2">Features</text>
              <view className="flex flex-col gap-2">
                <view className="flex items-center gap-2">
                  <view className="w-2 h-2 bg-[#4CAF50] rounded-full"></view>
                  <text className="text-base text-[#333333]">
                    Create, read, update, and delete todos
                  </text>
                </view>
                <view className="flex items-center gap-2">
                  <view className="w-2 h-2 bg-[#4CAF50] rounded-full"></view>
                  <text className="text-base text-[#333333]">
                    Edit todos by tapping on them
                  </text>
                </view>
                <view className="flex items-center gap-2">
                  <view className="w-2 h-2 bg-[#4CAF50] rounded-full"></view>
                  <text className="text-base text-[#333333]">
                    Persistent storage using localStorage
                  </text>
                </view>
                <view className="flex items-center gap-2">
                  <view className="w-2 h-2 bg-[#4CAF50] rounded-full"></view>
                  <text className="text-base text-[#333333]">
                    Responsive mobile-first design
                  </text>
                </view>
                <view className="flex items-center gap-2">
                  <view className="w-2 h-2 bg-[#4CAF50] rounded-full"></view>
                  <text className="text-base text-[#333333]">
                    User authentication
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      )}
    </view>
  );  
}
