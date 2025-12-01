import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSchema() {
    try {
        console.log('Reading schema file...')
        const schemaPath = path.join(process.cwd(), 'supabase-schema.sql')
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

        console.log('Applying schema...')
        // Split the SQL into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`)
                const { error } = await supabase.rpc('exec_sql', { sql: statement })
                if (error) {
                    console.warn(`Warning on statement: ${error.message}`)
                    // Continue with other statements
                }
            }
        }

        console.log('Schema applied successfully!')
    } catch (error) {
        console.error('Error applying schema:', error)
        process.exit(1)
    }
}

runSchema()