// Fichier: src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 1. Allez dans "Project Settings" > "API" sur Supabase
const supabaseUrl = 'https://buzpqarzciuruuqnjzyc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1enBxYXJ6Y2l1cnV1cW5qenljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzgwNTUsImV4cCI6MjA3ODAxNDA1NX0.pPRBBz4lIdjJ7WfDdZspLRlWvXR7xFIKyoBEEUPhuwU'

export const supabase = createClient(supabaseUrl, supabaseKey)