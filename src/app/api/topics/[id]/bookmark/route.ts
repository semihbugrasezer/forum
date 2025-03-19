import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const topicId = params.id;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Kullanıcı oturumu bulunamadı' }, 
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if topic exists
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('id', topicId)
      .single();
      
    if (topicError || !topic) {
      return NextResponse.json(
        { error: 'Konu bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Check if bookmark already exists
    const { data: existingBookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (bookmarkError) {
      console.error('Bookmark check error:', bookmarkError);
      return NextResponse.json(
        { error: 'Kayıt durumu kontrol edilirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
        
      if (deleteError) {
        console.error('Bookmark delete error:', deleteError);
        return NextResponse.json(
          { error: 'Kayıt kaldırılırken bir hata oluştu' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        bookmarked: false,
        message: 'Konu kaydedilenlerden kaldırıldı'
      });
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          topic_id: topicId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Bookmark insert error:', insertError);
        return NextResponse.json(
          { error: 'Konu kaydedilirken bir hata oluştu' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        bookmarked: true,
        message: 'Konu başarıyla kaydedildi'
      });
    }
  } catch (error) {
    console.error('Bookmark operation error:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const topicId = params.id;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { bookmarked: false }, 
        { status: 200 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if bookmark exists
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Bookmark check error:', error);
      return NextResponse.json(
        { error: 'Kayıt durumu kontrol edilirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      bookmarked: !!data 
    });
  } catch (error) {
    console.error('Bookmark check error:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 