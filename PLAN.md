# AI-Prioritized To-Do App Implementation Plan

## Tech Stack Analysis

- **Next.js 16.0.0** (App Router) - Server Actions for backend logic
- **Supabase** - Authentication + Postgres database
- **TailwindCSS v4** - Already configured
- **OpenAI API** (gpt-3.5-turbo) - Task categorization
- **TypeScript** - Type safety throughout

## Database Schema (Supabase)

### Table: `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  impact TEXT CHECK (impact IN ('High', 'Medium', 'Low')),
  effort TEXT CHECK (effort IN ('High', 'Medium', 'Low')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(user_id, completed);

-- Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

## Project Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── signup/
│       └── page.tsx          # Signup page
├── dashboard/
│   └── page.tsx              # Main dashboard (protected)
├── actions/
│   └── tasks.ts              # Server Actions for tasks
├── api/
│   └── categorize/
│       └── route.ts          # API route for OpenAI (alternative)
├── components/
│   ├── TaskInput.tsx         # Input field for new tasks
│   ├── TaskList.tsx          # List view of tasks
│   ├── TaskMatrix.tsx        # 2x2 matrix view
│   ├── TaskCard.tsx          # Individual task component
│   ├── EditTaskModal.tsx     # Modal for editing tasks
│   └── ViewToggle.tsx        # Switch between list/matrix
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Supabase client (client-side)
│   │   ├── server.ts         # Supabase client (server-side)
│   │   └── middleware.ts     # Auth middleware
│   ├── openai.ts             # OpenAI client
│   └── types.ts              # TypeScript types
└── middleware.ts             # Route protection

.env.local                     # Environment variables
```

## Implementation Steps

### 1. Environment Setup

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

Install dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr openai
```

### 2. Supabase Configuration

- Create `lib/supabase/client.ts` - Browser client with cookie handling
- Create `lib/supabase/server.ts` - Server-side client for Server Actions
- Create `lib/types.ts` - TypeScript interfaces for Task model

### 3. Authentication Flow

- Create `(auth)/login/page.tsx` - Email/password login with Supabase Auth
- Create `(auth)/signup/page.tsx` - User registration
- Create `middleware.ts` - Protect `/dashboard` route, redirect unauthenticated users
- Add sign-out functionality

### 4. OpenAI Integration

Create `lib/openai.ts`:

- Initialize OpenAI client
- `categorizeTasks()` function that sends task title to GPT-3.5-turbo
- Prompt: "Analyze this task and categorize it. Return JSON: {\"impact\": \"High|Medium|Low\", \"effort\": \"High|Medium|Low\"}. Impact = business value, Effort = time/complexity."
- Parse JSON response with error handling
- Fallback to Medium/Medium if API fails

### 5. Server Actions

Create `app/actions/tasks.ts`:

- `createTask(title)` - Insert task, call OpenAI, update with categorization
- `updateTask(id, updates)` - Update task fields
- `deleteTask(id)` - Delete task
- `toggleComplete(id)` - Toggle completed status
- `getTasks()` - Fetch user's tasks with filtering
- All actions verify user authentication and use RLS

### 6. Dashboard UI Components

**TaskInput.tsx** (Client Component):

- Text input with enter-to-submit
- Loading state during AI categorization
- Optimistic UI update
- Form validation

**TaskList.tsx** (Client Component):

- Display tasks grouped by status (incomplete first)
- Color-coded badges for impact/effort
- Checkbox for completion
- Edit/delete buttons
- Empty state

**TaskMatrix.tsx** (Client Component):

- 2x2 grid: Effort (Low/Med/High) on X-axis, Impact (High/Med/Low) on Y-axis
- 9 cells total (3x3 matrix for Medium values)
- Drag-and-drop support for manual recategorization
- Color coding: High Impact + Low Effort = green (do first)
- Responsive design

**TaskCard.tsx**:

- Task title with edit inline capability
- Impact/Effort badges (clickable to edit)
- Completion checkbox
- Delete button with confirmation
- Last updated timestamp

**EditTaskModal.tsx**:

- Modal overlay for editing task
- Update title, impact, effort
- Save/cancel buttons
- Validation

**ViewToggle.tsx**:

- Toggle button between list/matrix views
- Persist preference in localStorage

### 7. Dashboard Page

Create `dashboard/page.tsx`:

- Server Component that fetches initial tasks
- Auth check (redirect if not logged in)
- Pass tasks to client components
- Header with user email and logout button
- View toggle
- Conditional render: TaskList or TaskMatrix
- Real-time updates using Supabase subscriptions (optional enhancement)

### 8. Security & Performance Best Practices

**Security**:

- RLS policies on Supabase (users only access own data)
- Server Actions validate auth on every request
- OpenAI API key only on server (never exposed to client)
- Input sanitization to prevent XSS
- Rate limiting on task creation (optional)
- CSRF protection via Next.js Server Actions

**Performance**:

- Server Components for initial render (faster TTI)
- Client Components only where interactivity needed
- Optimistic updates for instant feedback
- Debounce task input if doing live AI suggestions
- Index on `user_id` and `completed` in database
- Cache OpenAI responses for identical tasks (optional)
- Streaming responses for large task lists

**Error Handling**:

- Try-catch in all Server Actions
- Toast notifications for errors
- Fallback UI if AI fails
- Network error recovery

### 9. Styling with TailwindCSS

- Modern, clean design with proper spacing
- Dark mode support (optional)
- Responsive breakpoints (mobile-first)
- Animations for task additions/completions
- Accessibility (ARIA labels, keyboard navigation)

### 10. Setup Instructions Document

Create setup guide for:

- Creating Supabase project
- Running SQL schema
- Enabling RLS
- Getting OpenAI API key
- Running migrations
- Local development setup

## Testing Checklist

- [x] User can sign up and log in
- [x] Unauthenticated users redirected from dashboard
- [x] Task creation calls OpenAI and saves categorization
- [x] Tasks display in both list and matrix views
- [x] Users can toggle views (state persists)
- [x] Users can edit task title and categories
- [x] Users can complete/uncomplete tasks
- [x] Users can delete tasks
- [x] Completed tasks styled differently
- [x] RLS prevents cross-user data access
- [x] Error handling works (offline, API failures)
- [x] Mobile responsive

### To-dos

- [x] Install dependencies (@supabase/supabase-js, @supabase/ssr, openai) and create .env.local template
- [x] Create Supabase client utilities (client.ts, server.ts) and type definitions
- [x] Document SQL schema for tasks table with RLS policies
- [x] Create OpenAI client and task categorization function
- [x] Build login and signup pages with Supabase Auth
- [x] Create middleware for route protection and auth validation
- [x] Implement Server Actions for CRUD operations and AI categorization
- [x] Build TaskInput, TaskCard, and EditTaskModal components
- [x] Create TaskList component with grouping and filtering
- [x] Create TaskMatrix component with 3x3 grid layout and drag-drop
- [x] Build ViewToggle component with localStorage persistence
- [x] Build main dashboard page integrating all components
- [x] Create README with Supabase setup instructions and SQL migration
