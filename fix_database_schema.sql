-- Fix database schema: Add missing columns to tasks table
-- This script should be run in the Supabase SQL editor

-- First, check if the tasks table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Create the tasks table if it doesn't exist, or add missing columns
DO $$ 
BEGIN
    -- Check if tasks table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tasks'
    ) THEN
        -- Create the entire table
        CREATE TABLE tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
            ai_priority_score INTEGER,
            ai_reasoning TEXT,
            due_date TIMESTAMP WITH TIME ZONE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created tasks table with all columns';
    ELSE
        -- Table exists, check and add missing columns
        
        -- Check if status column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'status'
        ) THEN
            ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled'));
            RAISE NOTICE 'Added status column to tasks table';
        ELSE
            RAISE NOTICE 'status column already exists';
        END IF;
        
        -- Check if priority column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'priority'
        ) THEN
            ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
            RAISE NOTICE 'Added priority column to tasks table';
        ELSE
            RAISE NOTICE 'priority column already exists';
        END IF;
        
        -- Check if ai_priority_score column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'ai_priority_score'
        ) THEN
            ALTER TABLE tasks ADD COLUMN ai_priority_score INTEGER;
            RAISE NOTICE 'Added ai_priority_score column to tasks table';
        ELSE
            RAISE NOTICE 'ai_priority_score column already exists';
        END IF;
        
        -- Check if ai_reasoning column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'ai_reasoning'
        ) THEN
            ALTER TABLE tasks ADD COLUMN ai_reasoning TEXT;
            RAISE NOTICE 'Added ai_reasoning column to tasks table';
        ELSE
            RAISE NOTICE 'ai_reasoning column already exists';
        END IF;
        
        -- Check if due_date column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'due_date'
        ) THEN
            ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added due_date column to tasks table';
        ELSE
            RAISE NOTICE 'due_date column already exists';
        END IF;
        
        -- Check if user_id column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE tasks ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to tasks table';
        ELSE
            RAISE NOTICE 'user_id column already exists';
        END IF;
        
        -- Check if created_at column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'created_at'
        ) THEN
            ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to tasks table';
        ELSE
            RAISE NOTICE 'created_at column already exists';
        END IF;
        
        -- Check if updated_at column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to tasks table';
        ELSE
            RAISE NOTICE 'updated_at column already exists';
        END IF;
    END IF;
END $$;

-- Verify the table structure after changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);

-- Enable Row Level Security if not already enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    -- Check if policies exist and create them if they don't
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can view their own tasks'
    ) THEN
        CREATE POLICY "Users can view their own tasks" ON tasks
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can insert their own tasks'
    ) THEN
        CREATE POLICY "Users can insert their own tasks" ON tasks
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can update their own tasks'
    ) THEN
        CREATE POLICY "Users can update their own tasks" ON tasks
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can delete their own tasks'
    ) THEN
        CREATE POLICY "Users can delete their own tasks" ON tasks
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create the update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_tasks_updated_at'
    ) THEN
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Final verification
SELECT 'Database schema fixed successfully!' as status;
