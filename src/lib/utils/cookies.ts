export const parseSupabaseCookie = (cookie: string | undefined) => {
  if (!cookie) return null;
  
  try {
    if (cookie.startsWith('base64-')) {
      const base64Data = cookie.slice(7);
      return JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));
    }
    return JSON.parse(cookie);
  } catch (error) {
    console.error('Error parsing Supabase cookie:', error);
    return null;
  }
};

export const createSupabaseCookie = (session: any) => {
  const base64Data = Buffer.from(JSON.stringify(session)).toString('base64');
  return `base64-${base64Data}`;
}; 