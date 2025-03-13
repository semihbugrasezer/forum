/**
 * Forum için mock veri dosyası
 * Bu dosya, Firestore bağlantısı olmadığında veya veri olmadığında gösterilecek örnek verileri içerir.
 */

// Mock konu verileri
export const mockTopicsByCategory = {
  havacilik: [
    {
      id: "mock-havacilik-1",
      title: "THY'nin yeni uçak alımları hakkında bilgiler",
      content:
        "Türk Hava Yolları, filosunu genişletmek için Airbus ve Boeing'den yeni uçaklar almaya hazırlanıyor. Bu alımlar havacılık sektörü için ne anlama geliyor? Bu konuda düşüncelerinizi paylaşın.\n\nYeni nesil uçaklar, daha az yakıt tüketimi ve daha fazla konfor sunuyor. Ayrıca çevresel etkileri de daha az. THY'nin bu hamlesinin şirketin geleceği için önemli olduğunu düşünüyorum.",
      tags: ["THY", "Uçak Filosu", "Airbus", "Boeing"],
      authorId: "user1",
      authorName: "Ahmet Yılmaz",
      authorPhoto: null,
      likeCount: 42,
      commentCount: 15,
      views: 230,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
      category: "havacilik",
      hasLiked: false,
    },
    {
      id: "mock-havacilik-2",
      title: "Havacılık tarihinde dönüm noktaları",
      content:
        "Havacılık tarihi birçok önemli dönüm noktasıyla dolu. İlk uçuştan jet motorlarına, yolcu uçaklarının gelişiminden uzay yolculuklarına kadar havacılık tarihindeki en önemli anları tartışalım.\n\nBence en önemli dönüm noktası, Wright Kardeşler'in ilk kontrollü ve sürdürülebilir uçuşu gerçekleştirmesi. Bu olay, tüm modern havacılığın başlangıcı olarak kabul edilebilir.",
      tags: ["Havacılık Tarihi", "Wright Kardeşler", "Jet Motorları"],
      authorId: "user2",
      authorName: "Ayşe Demir",
      authorPhoto: null,
      likeCount: 38,
      commentCount: 22,
      views: 189,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 gün önce
      category: "havacilik",
      hasLiked: false,
    },
    {
      id: "mock-havacilik-3",
      title: "İstanbul Havalimanı'nın geleceği",
      content:
        "İstanbul Havalimanı, dünyanın en büyük havalimanlarından biri olarak hizmet veriyor. Gelecekte ne gibi değişiklikler ve genişlemeler planlanıyor? Bu mega projenin geleceği hakkında tahminleriniz neler?\n\nYeni terminaller ve pist genişletmeleri ile daha fazla uçuşa ev sahipliği yapabilir. Ayrıca, çevresindeki bölgelerde yeni iş merkezleri ve konut projeleri de gelişebilir.",
      tags: ["İstanbul Havalimanı", "Havalimanı", "Ulaşım"],
      authorId: "user3",
      authorName: "Mehmet Kaya",
      authorPhoto: null,
      likeCount: 25,
      commentCount: 18,
      views: 142,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 gün önce
      category: "havacilik",
      hasLiked: false,
    },
  ],
  seyahat: [
    {
      id: "mock-seyahat-1",
      title: "Kapadokya'da mutlaka görülmesi gereken yerler",
      content:
        "Kapadokya, Türkiye'nin en popüler turistik bölgelerinden biri. Burada mutlaka görülmesi gereken yerler, konaklama önerileri ve aktiviteler hakkında bilgi paylaşalım.\n\nGöreme Açık Hava Müzesi, Uçhisar Kalesi ve Derinkuyu Yeraltı Şehri mutlaka görülmesi gereken yerler arasında. Ayrıca, güneşin doğuşunu izlemek için yapılan balon turları da unutulmaz bir deneyim sunuyor.",
      tags: ["Kapadokya", "Gezi", "Türkiye"],
      authorId: "user1",
      authorName: "Ahmet Yılmaz",
      authorPhoto: null,
      likeCount: 75,
      commentCount: 41,
      views: 520,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 gün önce
      category: "seyahat",
      hasLiked: false,
    },
    {
      id: "mock-seyahat-2",
      title: "Avrupa'da bütçe dostu tatil rotaları",
      content:
        "Avrupa'da tatil yapmak isteyenler için bütçe dostu şehirler ve rotalar hangileri? Ucuz uçuşlar, ekonomik konaklama ve yemek seçenekleri hakkında önerileriniz neler?\n\nDoğu Avrupa ülkeleri genellikle daha uygun fiyatlı seçenekler sunuyor. Özellikle Budapeşte, Prag ve Krakow gibi şehirler hem kültürel açıdan zengin hem de ekonomik.",
      tags: ["Avrupa", "Ekonomik Tatil", "Seyahat İpuçları"],
      authorId: "user2",
      authorName: "Ayşe Demir",
      authorPhoto: null,
      likeCount: 89,
      commentCount: 37,
      views: 612,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 gün önce
      category: "seyahat",
      hasLiked: false,
    },
    {
      id: "mock-seyahat-3",
      title: "Yurtdışı seyahatlerinde dikkat edilmesi gerekenler",
      content:
        "Yurtdışına ilk kez çıkacaklar için önemli ipuçları ve dikkat edilmesi gereken konular hakkında bir rehber oluşturalım. Vize işlemleri, sigorta, para değişimi ve güvenlik konuları dahil.\n\nSeyahat sigortası yaptırmak çok önemli. Ayrıca, gideceğiniz ülkenin yerel para birimi hakkında bilgi sahibi olmak ve güncel döviz kurlarını takip etmek de önemli.",
      tags: ["Yurtdışı", "Seyahat Güvenliği", "Vize İşlemleri"],
      authorId: "user3",
      authorName: "Mehmet Kaya",
      authorPhoto: null,
      likeCount: 63,
      commentCount: 29,
      views: 415,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 gün önce
      category: "seyahat",
      hasLiked: false,
    },
  ],
  kultur: [
    {
      id: "mock-kultur-1",
      title: "THY'nin kültür elçiliği rolü",
      content:
        "Türk Hava Yolları'nın Türk kültürünü dünyaya tanıtmaktaki rolü hakkında ne düşünüyorsunuz? THY'nin uluslararası uçuşlarda sunduğu kültürel deneyimler ve tanıtım faaliyetleri neler?\n\nTHY'nin \"Turkish Airlines Invest On Board\" programı ile Türk filmleri, müzikleri ve kültürel içerikler dünya çapında yolculara sunuluyor. Bu, Türk kültürünün tanıtımı için önemli bir fırsat.",
      tags: ["THY", "Kültür", "Tanıtım"],
      authorId: "user1",
      authorName: "Ahmet Yılmaz",
      authorPhoto: null,
      likeCount: 48,
      commentCount: 19,
      views: 267,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 gün önce
      category: "kultur",
      hasLiked: false,
    },
    {
      id: "mock-kultur-2",
      title: "Türk sinemasının dünya sinemasındaki yeri",
      content:
        "Türk sineması son yıllarda uluslararası festivallerde büyük başarılar elde ediyor. Dünya sinemasındaki yeri, önemli yönetmenler ve filmler hakkında bir tartışma başlatalım.\n\nNuri Bilge Ceylan, Fatih Akın ve Ferzan Özpetek gibi yönetmenler uluslararası alanda Türk sinemasını temsil eden önemli isimler. Bu yönetmenlerin filmleri, Cannes ve Berlin gibi prestijli festivallerde ödüller kazandı.",
      tags: ["Türk Sineması", "Filmler", "Festivaller"],
      authorId: "user2",
      authorName: "Ayşe Demir",
      authorPhoto: null,
      likeCount: 57,
      commentCount: 31,
      views: 345,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 gün önce
      category: "kultur",
      hasLiked: false,
    },
    {
      id: "mock-kultur-3",
      title: "Türk mutfağının bilinmeyen lezzetleri",
      content:
        "Türk mutfağı sadece kebap ve baklavadan ibaret değil. Yurtdışında pek bilinmeyen ama mutlaka tadılması gereken Türk yemekleri hangileri? Bölgesel lezzetler ve tarifler hakkında konuşalım.\n\nKaradeniz bölgesinin muhlama ve hamsi tava gibi lezzetleri, Ege'nin zeytinyağlı yemekleri, Güneydoğu'nun çiğ köfte ve içli köfte gibi özel tatları... Türk mutfağı çok zengin bir kültüre sahip.",
      tags: ["Türk Mutfağı", "Yemekler", "Gastronomi"],
      authorId: "user3",
      authorName: "Mehmet Kaya",
      authorPhoto: null,
      likeCount: 82,
      commentCount: 47,
      views: 593,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 gün önce
      category: "kultur",
      hasLiked: false,
    },
  ],
  miles: [
    {
      id: "mock-miles-1",
      title: "THY Miles&Smiles programı hakkında ipuçları",
      content:
        "THY'nin Miles&Smiles programından en iyi şekilde nasıl yararlanabilirsiniz? Mil biriktirme, harcama ve status yükseltme stratejileri hakkında deneyimlerinizi paylaşalım.\n\nBanka kredi kartı ortaklıkları, uçuş dışı mil kazanma yöntemleri ve sürpriz kampanyaları takip etmek önemli stratejiler arasında.",
      tags: ["Miles&Smiles", "THY", "Mil Biriktirme"],
      authorId: "user1",
      authorName: "Ahmet Yılmaz",
      authorPhoto: null,
      likeCount: 56,
      commentCount: 23,
      views: 312,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
      category: "miles",
      hasLiked: false,
    },
    {
      id: "mock-miles-2",
      title: "Status Match fırsatları ve deneyimler",
      content:
        "Diğer havayolu şirketlerindeki statünüzü THY Miles&Smiles'a taşıma süreci nasıl işliyor? Status match başvuru süreci, kabul kriterleri ve deneyimleriniz hakkında bilgi paylaşalım.\n\nBen geçen yıl British Airways'deki Silver statümü THY Elite'e taşıdım ve süreç oldukça hızlı ilerledi. Gerekli belgeleri sunmanız ve başvuru formunu doldurmanız yeterli.",
      tags: ["Status Match", "Miles&Smiles", "Elite Status"],
      authorId: "user2",
      authorName: "Ayşe Demir",
      authorPhoto: null,
      likeCount: 42,
      commentCount: 19,
      views: 278,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 gün önce
      category: "miles",
      hasLiked: false,
    },
    {
      id: "mock-miles-3",
      title: "En iyi mil kullanım stratejileri",
      content:
        "Biriktirdiğiniz THY millerini en verimli şekilde nasıl kullanabilirsiniz? Business class yükseltme, bedava bilet veya program ortaklarında harcama seçeneklerinden hangileri daha avantajlı?\n\nUzun mesafe uçuşlarda business class'a yükseltme genellikle en iyi değeri sunuyor. Özellikle peak season dışındaki dönemlerde uygunluk daha fazla oluyor.",
      tags: ["Mil Kullanımı", "Business Class", "Değer Hesaplama"],
      authorId: "user3",
      authorName: "Mehmet Kaya",
      authorPhoto: null,
      likeCount: 37,
      commentCount: 15,
      views: 246,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 gün önce
      category: "miles",
      hasLiked: false,
    },
  ],
};
