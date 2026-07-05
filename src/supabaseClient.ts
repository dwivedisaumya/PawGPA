import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://haqjecjxxnkyxgpgfpkk.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_isOXIq71f8udcV2r72w3sw_AYO280PG'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);