import { createClient } from '@supabase/supabase-js';
import { Database } from './database';

export const supabase = createClient<Database>(
	process.env.PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY
);
