import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageUpdates: Record<string, string> = {
  'annapurna-circuit': 'https://www.halfwayanywhere.com/wp-content/uploads/2022/05/Featured-Should-Not-Hike-Annapurna-No-Text.jpeg',
  'bandipur': 'https://www.footprintadventure.com/uploads/media/Villages/bandipur.jpg',
  'bardia-national-park': 'https://tigerencounter.com/wp-content/uploads/2023/01/Big-Five-Game-in-Bardia-National-Park.jpg',
  'bhaktapur': 'https://cms.altitudehimalaya.com/media/Blog/Travel-Stories/Bhaktapur-DS/Bhaktapur-Durbar-Square-Attractions.png',
  'chandragiri-hills': 'https://www.chandragirihills.com/wp-content/themes/yootheme/cache/6c/cablecar-banner-6c06e547.jpeg',
  'chitwan-national-park': 'https://www.wanderlustmagazine.com/wp-content/uploads/2023/11/cropped-dreamstime_xxl_68762448-scaled.jpg',
  'ghorepani-poon-hill': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Poon_hill_sunrise.jpg',
  'gosaikunda': 'https://www.himalayastrek.com/public/uploads/gosaikunda-trek.webp',
  'ilam': 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Tea_garden_at_ilam_nepal.jpg',
  'janakpur': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Janaki_Temple_Janakpur_Dhanusha_Nepal_Rajesh_Dhungana_%2813%29.jpg',
  'khaptad-national-park': 'https://visaliv.s3.ap-south-1.amazonaws.com/Khaptad-National-Park-Nepal.jpg',
  'langtang-valley': 'https://adventure-pulse.com/wp-content/uploads/2024/12/Langtang-valley-trek-Adventure-Pulse-3.jpg',
  'lumbini': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Mayadevi_Temple_and_ruins_of_ancient_monasteries_in_Lumbini_03.jpg/330px-Mayadevi_Temple_and_ruins_of_ancient_monasteries_in_Lumbini_03.jpg',
  'manaslu-circuit': 'https://adventure-pulse.com/wp-content/uploads/2024/11/Manaslu-Circuit-Trek-Adventure-Pulse-2-2.jpg',
  'nagarkot': 'https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1295,h_720/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/c5eac70b-Nagarkot-Sunrise-Tour/KathmanduNagarkotHillSunriseHalf-DayTour.jpg',
  'pashupatinath': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Pashupatinath_Temple-2020.jpg/1280px-Pashupatinath_Temple-2020.jpg',
  'patan': 'https://tourisminfonepal.com/wp-content/uploads/2024/06/patan-durbar-square.jpg',
  'phoksundo-lake': 'https://worldexpeditions.com/croppedImages/Indian-Sub-Continent/Nepal/shutterstock_2229278829-7602376-1920px.jpg',
  'rara-lake': 'https://visaliv.s3.ap-south-1.amazonaws.com/Rara-Lake-Nepal.jpg',
  'sagarmatha-national-park': 'https://live.staticflickr.com/540/31941068402_03ef8639d0_o.jpg',
  'swayambhunath': 'https://c8.alamy.com/comp/2RC88D5/a-landscape-around-swayambhunath-temple-an-ancient-religious-complex-atop-a-hill-in-the-kathmandu-valley-nepal-2RC88D5.jpg',
  'tilicho-lake': 'https://nepalgatewaytrekking.com/_next/image?url=https%3A%2F%2Fmedia.app.nepalgatewaytrekking.com%2Fuploads%2Ffullbanner%2Ftilicho-4920m.webp&w=3840&q=75&dpl=dpl_CGKTmXvtGnARAARMjmiTByUSxyXT',
  'upper-mustang': 'https://www.thelongestwayhome.com/blog/wp-content/uploads/2019/07/View-of-Lo-Manthang-Kingdom-of-Lo-from-the-castles.jpg',
};

async function main() {
  console.log('Starting image URL fix for 23 broken destinations...');
  
  let updated = 0;
  let notFound = 0;
  
  for (const [slug, newUrl] of Object.entries(imageUpdates)) {
    try {
      const result = await prisma.destination.updateMany({
        where: { slug },
        data: { imageUrl: newUrl },
      });
      if (result.count > 0) {
        updated++;
        console.log(`✅ Updated: ${slug}`);
      } else {
        notFound++;
        console.log(`⚠️  Not found: ${slug}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${slug}:`, err);
    }
  }
  
  console.log(`\nDone! Updated: ${updated}, Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
