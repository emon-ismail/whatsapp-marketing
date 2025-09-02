import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export const handler = async (event, context) => {
  try {
    // Simple ping to keep database active
    const { data, error } = await supabase
      .from('moderators')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Keep-alive ping failed:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Ping failed' })
      }
    }

    console.log('Database pinged successfully at:', new Date().toISOString())
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Database pinged successfully',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Keep-alive error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}