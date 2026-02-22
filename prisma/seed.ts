import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vocabData = [
  // Travel - Easy
  { word: 'airport', ipa: '/ˈeə.pɔːt/', meaning: 'a place where aircraft regularly take off and land', example: 'We arrived at the airport two hours early.', topic: 'travel', difficulty: 'easy' },
  { word: 'hotel', ipa: '/həʊˈtel/', meaning: 'a building where you pay to have a room to sleep in', example: 'We stayed at a luxury hotel near the beach.', topic: 'travel', difficulty: 'easy' },
  { word: 'ticket', ipa: '/ˈtɪk.ɪt/', meaning: 'a small piece of paper or card given to show payment', example: 'Please show your ticket at the entrance.', topic: 'travel', difficulty: 'easy' },
  { word: 'passport', ipa: '/ˈpɑː.spɔːt/', meaning: 'an official document for traveling abroad', example: 'Don\'t forget to bring your passport.', topic: 'travel', difficulty: 'easy' },
  { word: 'luggage', ipa: '/ˈlʌɡ.ɪdʒ/', meaning: 'bags and suitcases used to carry possessions', example: 'We have too much luggage for the trip.', topic: 'travel', difficulty: 'easy' },
  
  // Travel - Medium
  { word: 'itinerary', ipa: '/aɪˈtɪn.ər.ər.i/', meaning: 'a detailed plan of a journey', example: 'Our itinerary includes visits to three cities.', topic: 'travel', difficulty: 'medium' },
  { word: 'reservation', ipa: '/ˌrez.əˈveɪ.ʃən/', meaning: 'an arrangement to have something kept for you', example: 'I made a reservation at the restaurant.', topic: 'travel', difficulty: 'medium' },
  { word: 'boarding', ipa: '/ˈbɔː.dɪŋ/', meaning: 'the act of getting on a plane or ship', example: 'Boarding will begin in 30 minutes.', topic: 'travel', difficulty: 'medium' },
  { word: 'customs', ipa: '/ˈkʌs.təmz/', meaning: 'the place where your bags are checked at airports', example: 'We went through customs quickly.', topic: 'travel', difficulty: 'medium' },
  { word: 'destination', ipa: '/ˌdes.tɪˈneɪ.ʃən/', meaning: 'the place where someone is going', example: 'Paris is our final destination.', topic: 'travel', difficulty: 'medium' },
  
  // Travel - Hard
  { word: 'expatriate', ipa: '/ekˈspæt.ri.ət/', meaning: 'someone living in a foreign country', example: 'He works as an expatriate in Singapore.', topic: 'travel', difficulty: 'hard' },
  { word: 'jet lag', ipa: '/ˈdʒet.læɡ/', meaning: 'tiredness after traveling across time zones', example: 'I\'m suffering from jet lag after the long flight.', topic: 'travel', difficulty: 'hard' },
  
  // Business - Easy
  { word: 'meeting', ipa: '/ˈmiː.tɪŋ/', meaning: 'a gathering of people for discussion', example: 'We have a meeting at 3 PM today.', topic: 'business', difficulty: 'easy' },
  { word: 'email', ipa: '/ˈiː.meɪl/', meaning: 'a message sent electronically', example: 'I\'ll send you an email with the details.', topic: 'business', difficulty: 'easy' },
  { word: 'office', ipa: '/ˈɒf.ɪs/', meaning: 'a room or building for work', example: 'Our office is located downtown.', topic: 'business', difficulty: 'easy' },
  { word: 'manager', ipa: '/ˈmæn.ɪ.dʒər/', meaning: 'a person in charge of a business or team', example: 'The manager approved our project.', topic: 'business', difficulty: 'easy' },
  { word: 'client', ipa: '/ˈklaɪ.ənt/', meaning: 'a person who uses professional services', example: 'We have a new client this month.', topic: 'business', difficulty: 'easy' },
  
  // Business - Medium
  { word: 'deadline', ipa: '/ˈded.laɪn/', meaning: 'a time by which something must be finished', example: 'The deadline for this project is Friday.', topic: 'business', difficulty: 'medium' },
  { word: 'negotiation', ipa: '/nəˌɡəʊ.ʃiˈeɪ.ʃən/', meaning: 'discussion to reach an agreement', example: 'The negotiation lasted three hours.', topic: 'business', difficulty: 'medium' },
  { word: 'revenue', ipa: '/ˈrev.ə.njuː/', meaning: 'income from business activities', example: 'Our revenue increased by 20% this year.', topic: 'business', difficulty: 'medium' },
  { word: 'strategy', ipa: '/ˈstræt.ə.dʒi/', meaning: 'a plan to achieve a goal', example: 'We need a new marketing strategy.', topic: 'business', difficulty: 'medium' },
  
  // Business - Hard
  { word: 'acquisition', ipa: '/ˌæk.wɪˈzɪʃ.ən/', meaning: 'the act of buying a company', example: 'The acquisition was worth millions of dollars.', topic: 'business', difficulty: 'hard' },
  { word: 'liability', ipa: '/ˌlaɪ.əˈbɪl.ə.ti/', meaning: 'legal responsibility for debts or damages', example: 'The company has significant financial liabilities.', topic: 'business', difficulty: 'hard' },
  
  // Technology - Easy
  { word: 'computer', ipa: '/kəmˈpjuː.tər/', meaning: 'an electronic device for storing and processing data', example: 'I work on my computer every day.', topic: 'technology', difficulty: 'easy' },
  { word: 'internet', ipa: '/ˈɪn.tə.net/', meaning: 'a global network connecting computers', example: 'The internet has changed how we communicate.', topic: 'technology', difficulty: 'easy' },
  { word: 'website', ipa: '/ˈweb.saɪt/', meaning: 'a collection of pages on the internet', example: 'Visit our website for more information.', topic: 'technology', difficulty: 'easy' },
  { word: 'password', ipa: '/ˈpɑːs.wɜːd/', meaning: 'a secret word for accessing a system', example: 'Please enter your password to continue.', topic: 'technology', difficulty: 'easy' },
  { word: 'software', ipa: '/ˈsɒft.weər/', meaning: 'programs used by computers', example: 'This software helps you edit photos.', topic: 'technology', difficulty: 'easy' },
  
  // Technology - Medium
  { word: 'algorithm', ipa: '/ˈæl.ɡə.rɪ.ðəm/', meaning: 'a set of rules for solving problems', example: 'The search engine uses a complex algorithm.', topic: 'technology', difficulty: 'medium' },
  { word: 'database', ipa: '/ˈdeɪ.tə.beɪs/', meaning: 'an organized collection of data', example: 'All customer information is stored in our database.', topic: 'technology', difficulty: 'medium' },
  { word: 'interface', ipa: '/ˈɪn.tə.feɪs/', meaning: 'the way a user interacts with a system', example: 'The app has a user-friendly interface.', topic: 'technology', difficulty: 'medium' },
  { word: 'bandwidth', ipa: '/ˈbænd.wɪtθ/', meaning: 'the capacity of a network connection', example: 'We need more bandwidth for video streaming.', topic: 'technology', difficulty: 'medium' },
  { word: 'encryption', ipa: '/ɪnˈkrɪp.ʃən/', meaning: 'the process of encoding information', example: 'Encryption protects your data from hackers.', topic: 'technology', difficulty: 'medium' },
  
  // Technology - Hard
  { word: 'cybersecurity', ipa: '/ˈsaɪ.bə.sɪˌkjʊə.rə.ti/', meaning: 'protection of computer systems from theft', example: 'Cybersecurity is critical for all businesses.', topic: 'technology', difficulty: 'hard' },
  { word: 'virtualization', ipa: '/ˌvɜː.tʃu.ə.laɪˈzeɪ.ʃən/', meaning: 'creating virtual versions of hardware', example: 'Virtualization helps us save server costs.', topic: 'technology', difficulty: 'hard' },
  
  // Daily Life - Easy
  { word: 'breakfast', ipa: '/ˈbrek.fəst/', meaning: 'the first meal of the day', example: 'I eat breakfast at 8 AM every morning.', topic: 'daily life', difficulty: 'easy' },
  { word: 'grocery', ipa: '/ˈɡrəʊ.sər.i/', meaning: 'food and goods sold by a grocer', example: 'I need to buy groceries for the week.', topic: 'daily life', difficulty: 'easy' },
  { word: 'exercise', ipa: '/ˈek.sə.saɪz/', meaning: 'physical activity for health', example: 'I do exercise every morning.', topic: 'daily life', difficulty: 'easy' },
  { word: 'appointment', ipa: '/əˈpɔɪnt.mənt/', meaning: 'an arrangement to meet someone', example: 'I have a doctor\'s appointment tomorrow.', topic: 'daily life', difficulty: 'easy' },
  { word: 'commute', ipa: '/kəˈmjuːt/', meaning: 'travel between home and work', example: 'My commute takes about 30 minutes.', topic: 'daily life', difficulty: 'easy' },
  
  // Daily Life - Medium
  { word: 'household', ipa: '/ˈhaʊs.həʊld/', meaning: 'relating to a home and family', example: 'Household chores take up my weekend.', topic: 'daily life', difficulty: 'medium' },
  { word: 'maintenance', ipa: '/ˈmeɪn.tə.nəns/', meaning: 'the work needed to keep something in good condition', example: 'The building requires regular maintenance.', topic: 'daily life', difficulty: 'medium' },
  { word: 'errand', ipa: '/ˈer.ənd/', meaning: 'a short trip to do something', example: 'I have some errands to run in town.', topic: 'daily life', difficulty: 'medium' },
  { word: 'routine', ipa: '/ruːˈtiːn/', meaning: 'a sequence of actions regularly followed', example: 'I follow the same routine every day.', topic: 'daily life', difficulty: 'medium' },
  { word: 'leisure', ipa: '/ˈleʒ.ər/', meaning: 'free time for enjoyment', example: 'Reading is my favorite leisure activity.', topic: 'daily life', difficulty: 'medium' },
  
  // Daily Life - Hard
  { word: 'procrastination', ipa: '/prəˌkræs.tɪˈneɪ.ʃən/', meaning: 'delaying tasks that need to be done', example: 'Procrastination makes me stressed.', topic: 'daily life', difficulty: 'hard' },
  { word: 'multitasking', ipa: '/ˌmʌl.tiˈtɑː.skɪŋ/', meaning: 'doing several things at the same time', example: 'Multitasking can reduce productivity.', topic: 'daily life', difficulty: 'hard' },
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.vocabulary.deleteMany();
  
  // Insert vocabulary
  for (const vocab of vocabData) {
    await prisma.vocabulary.create({
      data: vocab,
    });
  }
  
  console.log(`Seeded ${vocabData.length} vocabulary items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
