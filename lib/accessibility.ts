// Accessibility utilities and constants

export const ARIA_LABELS = {
  // Task management
  addTask: "Add new task",
  editTask: "Edit task",
  deleteTask: "Delete task",
  completeTask: "Mark task as complete",
  incompleteTask: "Mark task as incomplete",
  toggleTask: "Toggle task completion status",

  // Navigation
  signOut: "Sign out of account",
  toggleView: "Toggle between list and matrix view",
  userMenu: "User account menu",

  // Form elements
  taskTitle: "Task title",
  taskDescription: "Task description",
  taskPriority: "Task priority level",
  taskStatus: "Task status",

  // Matrix view
  matrixCell: "Task priority matrix cell",
  highImpactLowEffort: "High impact, low effort tasks - do first",
  highImpactMediumEffort: "High impact, medium effort tasks - schedule",
  highImpactHighEffort: "High impact, high effort tasks - delegate",
  mediumImpactLowEffort: "Medium impact, low effort tasks - quick wins",
  mediumImpactMediumEffort: "Medium impact, medium effort tasks - consider",
  mediumImpactHighEffort: "Medium impact, high effort tasks - maybe later",
  lowImpactLowEffort: "Low impact, low effort tasks - fill time",
  lowImpactMediumEffort: "Low impact, medium effort tasks - avoid",
  lowImpactHighEffort: "Low impact, high effort tasks - don't do",

  // Status indicators
  taskCompleted: "Task completed",
  taskInProgress: "Task in progress",
  taskTodo: "Task to do",
  taskCancelled: "Task cancelled",

  // Priority indicators
  urgentPriority: "Urgent priority task",
  highPriority: "High priority task",
  mediumPriority: "Medium priority task",
  lowPriority: "Low priority task",

  // Loading states
  loadingTasks: "Loading tasks",
  creatingTask: "Creating task",
  updatingTask: "Updating task",
  deletingTask: "Deleting task",

  // Error states
  errorLoading: "Error loading tasks",
  errorCreating: "Error creating task",
  errorUpdating: "Error updating task",
  errorDeleting: "Error deleting task",
};

export const KEYBOARD_SHORTCUTS = {
  // Global shortcuts
  addTask: "Ctrl+Enter",
  toggleView: "Ctrl+Shift+V",
  signOut: "Ctrl+Shift+Q",

  // Task shortcuts
  completeTask: "Space",
  editTask: "Enter",
  deleteTask: "Delete",
  cancelEdit: "Escape",

  // Navigation shortcuts
  nextTask: "ArrowDown",
  previousTask: "ArrowUp",
  firstTask: "Home",
  lastTask: "End",
};

export const FOCUS_MANAGEMENT = {
  // Focus trap for modals
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => element.removeEventListener("keydown", handleTabKey);
  },

  // Focus restoration
  restoreFocus: (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  },

  // Focus management for dynamic content
  manageFocus: (container: HTMLElement, newElement: HTMLElement) => {
    const currentFocus = document.activeElement as HTMLElement;
    const focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentFocus);
    const newIndex = focusableElements.indexOf(newElement);

    if (newIndex !== -1) {
      newElement.focus();
    } else if (
      currentIndex !== -1 &&
      currentIndex < focusableElements.length - 1
    ) {
      focusableElements[currentIndex + 1]?.focus();
    }
  },
};

export const SCREEN_READER_ANNOUNCEMENTS = {
  taskAdded: (title: string) =>
    `Task "${title}" has been added and prioritized by AI`,
  taskCompleted: (title: string) => `Task "${title}" has been completed`,
  taskDeleted: (title: string) => `Task "${title}" has been deleted`,
  taskUpdated: (title: string) => `Task "${title}" has been updated`,
  viewChanged: (view: string) => `View changed to ${view} mode`,
  errorOccurred: (message: string) => `Error: ${message}`,
  loadingStarted: "Loading tasks",
  loadingCompleted: "Tasks loaded successfully",
};

export const SEMANTIC_HTML = {
  // Task list structure
  taskList: "list",
  taskItem: "listitem",
  taskGroup: "group",

  // Form structure
  form: "form",
  fieldset: "group",
  legend: "label",

  // Navigation structure
  navigation: "navigation",
  main: "main",
  header: "banner",
  footer: "contentinfo",

  // Interactive elements
  button: "button",
  link: "link",
  textbox: "textbox",
  checkbox: "checkbox",
  combobox: "combobox",
  menu: "menu",
  menuitem: "menuitem",
};

// Announce changes to screen readers
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// High contrast mode detection
export const isHighContrastMode = () => {
  return window.matchMedia("(prefers-contrast: high)").matches;
};

// Reduced motion detection
export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
