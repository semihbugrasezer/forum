import { createClient } from '@supabase/supabase-js';

const supabase = createClient('your-supabase-url', 'your-supabase-anon-key');

export async function getTopicBySlug(slug: string | undefined) {
  if (!slug) return null;

  try {
    const { data: topicBySlug } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (topicBySlug) return topicBySlug;

    // If not found by slug, try as ID
    if (!isNaN(Number(slug))) {
      const { data: topicById } = await supabase
        .from('topics')
        .select('*')
        .eq('id', Number(slug))
        .single();

      if (topicById) return topicById;
    }

    return null;
  } catch (error) {
    console.error('Error in getTopicBySlug:', error);
    return null;
  }
}
