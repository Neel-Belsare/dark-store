class SupabaseConfig {
  static const String supabaseUrl = 'https://wovfqutzuppauwretoiw.supabase.co';
  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdmZxdXR6dXBwYXV3cmV0b2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDk4OTIsImV4cCI6MjEwNjE4NTg5Mn0.djjjD0bnzwUo3ArsVKrlau43gRkCxPCyvAB1EPZOb7g';

  static Map<String, String> get headers => {
        'apikey': supabaseAnonKey,
        'Authorization': 'Bearer $supabaseAnonKey',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };
}
