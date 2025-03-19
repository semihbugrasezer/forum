import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const topicId = params.id;
    const { reason, details } = await request.json();
    
    // Validate input
    if (!reason) {
      return NextResponse.json(
        { error: 'Lütfen bir rapor nedeni belirtin' }, 
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Rapor göndermek için giriş yapmalısınız' }, 
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
    
    // Check if user already reported this topic
    const { data: existingReport, error: reportCheckError } = await supabase
      .from('reports')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (reportCheckError) {
      console.error('Report check error:', reportCheckError);
      return NextResponse.json(
        { error: 'Rapor durumu kontrol edilirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    if (existingReport) {
      return NextResponse.json(
        { error: 'Bu konuyu zaten rapor ettiniz' },
        { status: 400 }
      );
    }
    
    // Create report
    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        topic_id: topicId,
        user_id: userId,
        reason,
        details: details || '',
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Report insert error:', insertError);
      return NextResponse.json(
        { error: 'Rapor kaydedilirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Raporunuz başarıyla gönderildi. Teşekkür ederiz.'
    });
  } catch (error) {
    console.error('Report operation error:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 