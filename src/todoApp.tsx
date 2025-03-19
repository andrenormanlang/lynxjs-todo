import { useCallback, useEffect, useState } from "@lynx-js/react";
import "./index.css";

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
    <view className="App">
      {/* Navigation Bar */}
      <view className="NavBar">
        <view className="LogoContainer">
          <image
            src="assets/lynx-logo.png"
            className="LogoImage"
            style={{
              width: "32px",
              height: "32px",
              marginRight: "10px",
              background: "#112233",
              borderRadius: "50px",
            }}
          />
          <text className="NavTitle">Lynx Todos</text>
        </view>
        <view className="NavActions">
          <text className="UserBadge">{authState.currentUser}</text>
          <view className="HamburgerMenu" bindtap={toggleMenu}>
            <view className={`HamburgerIcon ${menuOpen ? "Open" : ""}`}>
              <view className="HamburgerLine"></view>
              <view className="HamburgerLine"></view>
              <view className="HamburgerLine"></view>
            </view>
          </view>
        </view>
      </view>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <view className="MobileMenu">
          <view
            className={`MenuItem ${currentView === "home" ? "Active" : ""}`}
            bindtap={() => navigateTo("home")}
          >
            <text className="MenuItemText">Tasks</text>
          </view>
          <view
            className={`MenuItem ${currentView === "about" ? "Active" : ""}`}
            bindtap={() => navigateTo("about")}
          >
            <text className="MenuItemText">About</text>
          </view>
          <view className="MenuItem LogoutItem" bindtap={handleLogout}>
            <text className="MenuItemText">Logout</text>
          </view>
        </view>
      )}

      {/* Main Content */}
      {currentView === "home" && (
        <view className="Content">
          {/* Todo Input Section */}
          <view className="TodoInputSection">
            <input
              className="TodoInput"
              value={newTodo}
              // @ts-ignore
              bindinput={(e) => setNewTodo(e.detail.value)}
              placeholder="Enter new todo"
              style={{
                color: "#000000",
                backgroundColor: "#ffffff",
                padding: "12px",
                borderRadius: "4px",
              }}
            />
            <text className="AddButton" bindtap={handleAddTodo}>
              Add Todo
            </text>
          </view>

          {/* Todo List */}
          <view className="TodoList">
            {todos.map((todo, index) => (
              <view key={index} className="TodoItem">
                {editIndex === index ? (
                  <view className="EditWrapper">
                    <input
                      className="EditInput"
                      value={editValue}
                      // @ts-ignore
                      bindinput={(e) => setEditValue(e.detail.value)}
                      style={{
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        padding: "8px",
                        width: "250px",
                      }}
                      autofocus={true}
                    />
                    <text
                      className="SaveButton"
                      bindtap={handleEditSave}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        borderRadius: "4px",
                      }}
                    >
                      ✓
                    </text>
                  </view>
                ) : (
                  <>
                    <view className="TodoLeftSection">
                      <view
                        className="CheckCircle"
                        bindtap={() => toggleComplete(index)}
                        style={{
                          border: "1px solid rgb(139, 185, 197)",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: completedTodos.includes(index)
                            ? "#4CAF50"
                            : "transparent",
                        }}
                      >
                        {completedTodos.includes(index) && (
                          <text style={{ color: "white", fontSize: "14px" }}>
                            ✓
                          </text>
                        )}
                      </view>
                      <text
                        className="TodoText"
                        bindtap={() => handleEditStart(index)}
                        style={{
                          textDecoration: completedTodos.includes(index)
                            ? "line-through"
                            : "none",
                          color: completedTodos.includes(index)
                            ? "#888"
                            : "#000",
                        }}
                      >
                        {todo}
                      </text>
                    </view>
                    <text
                      className="DeleteButton"
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
        <view className="Content">
          <view className="AboutSection">
            <text className="AboutTitle">About Lynx Todos</text>
            <text className="AboutText">
              This is a beautifully designed Todo application built with the
              Lynx framework. It demonstrates basic CRUD operations, local
              storage persistence, and responsive navigation.
            </text>
            <view className="FeatureCard">
              <text className="FeatureTitle">Features</text>
              <view className="FeatureList">
                <view className="FeatureItem">
                  <view className="FeatureBullet"></view>
                  <text className="FeatureText">
                    Create, read, update, and delete todos
                  </text>
                </view>
                <view className="FeatureItem">
                  <view className="FeatureBullet"></view>
                  <text className="FeatureText">
                    Edit todos by tapping on them
                  </text>
                </view>
                <view className="FeatureItem">
                  <view className="FeatureBullet"></view>
                  <text className="FeatureText">
                    Persistent storage using localStorage
                  </text>
                </view>
                <view className="FeatureItem">
                  <view className="FeatureBullet"></view>
                  <text className="FeatureText">
                    Responsive mobile-first design
                  </text>
                </view>
                <view className="FeatureItem">
                  <view className="FeatureBullet"></view>
                  <text className="FeatureText">User authentication</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      )}
    </view>
  );
}
