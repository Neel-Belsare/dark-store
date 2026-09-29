import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wovfqutzuppauwretoiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdmZxdXR6dXBwYXV3cmV0b2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDk4OTIsImV4cCI6MjEwNjE4NTg5Mn0.djjjD0bnzwUo3ArsVKrlau43gRkCxPCyvAB1EPZOb7g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);