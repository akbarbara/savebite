const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Checking if "images" bucket exists...');
  const { data: buckets, error: getError } = await supabase.storage.listBuckets();
  
  if (getError) {
    console.error('Error fetching buckets:', getError);
    return;
  }

  const imagesBucket = buckets.find(b => b.name === 'images');

  if (!imagesBucket) {
    console.log('Bucket "images" not found. Creating it...');
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      console.error('Failed to create bucket:', error);
    } else {
      console.log('Bucket "images" created successfully!');
    }
  } else {
    console.log('Bucket "images" already exists.');
    
    // Ensure it's public
    if (!imagesBucket.public) {
       console.log('Updating bucket to be public...');
       await supabase.storage.updateBucket('images', { public: true });
       console.log('Bucket updated.');
    }
  }
}

main();
