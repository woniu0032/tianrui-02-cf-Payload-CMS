const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { decode } = require('base64-arraybuffer');

const supabaseUrl = 'https://ce6b5e77-4b9f-4326-b982-6975cadd4081.meoo-cloud.com/sb-api';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4ODE1ODE3LCJleHAiOjEzMjg5NDU1ODE3fQ.YE0cJPZvV7GQsk_ALVpZCEZ1IVdXhwkoaCvspM58-Qs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  const arrayBuffer = decode(base64);

  const { data, error } = await supabase.storage
    .from('products')
    .upload(`fanglun/${fileName}`, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error(`上传失败 ${fileName}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('products')
    .getPublicUrl(`fanglun/${fileName}`);

  console.log(`上传成功: ${fileName}`);
  console.log(`URL: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function main() {
  const images = [
    { path: '/home/user-files/阻燃-芳纶CN_8822_18138044_245GSM_阻燃_防油防水防静电_深蓝.jpg', name: 'fanglun-main.jpg' },
    { path: '/home/user-files/阻燃-芳纶CN_8822_18138044_245GSM_阻燃_防油防水防静电_深蓝-1.jpg', name: 'fanglun-detail-1.jpg' },
    { path: '/home/user-files/阻燃-芳纶CN_8822_18138044_245GSM_阻燃_防油防水防静电_深蓝-2.jpg', name: 'fanglun-detail-2.jpg' }
  ];

  const urls = [];
  for (const img of images) {
    const url = await uploadImage(img.path, img.name);
    if (url) urls.push(url);
  }

  console.log('\n所有图片URL:');
  urls.forEach((url, i) => console.log(`[${i + 1}] ${url}`));
}

main().catch(console.error);
