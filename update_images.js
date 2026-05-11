const { Product } = require('./models');

const images = {
  '10000000000': 'https://loremflickr.com/200/200/coca+cola?lock=1',
  '10000000001': 'https://loremflickr.com/200/200/pepsi?lock=1',
  '10000000002': 'https://loremflickr.com/200/200/sprite+drink?lock=1',
  '10000000003': 'https://loremflickr.com/200/200/redbull?lock=1',
  '10000000004': 'https://loremflickr.com/200/200/monster+energy?lock=1',
  '10000000005': 'https://loremflickr.com/200/200/potato+chips?lock=1',
  '10000000006': 'https://loremflickr.com/200/200/doritos?lock=1',
  '10000000007': 'https://loremflickr.com/200/200/pringles?lock=1',
  '10000000008': 'https://loremflickr.com/200/200/snickers?lock=1',
  '10000000009': 'https://loremflickr.com/200/200/mms+candy?lock=1',
  '100000000010': 'https://loremflickr.com/200/200/apples?lock=1',
  '100000000011': 'https://loremflickr.com/200/200/bananas?lock=1',
  '100000000012': 'https://loremflickr.com/200/200/bread?lock=1',
  '100000000013': 'https://loremflickr.com/200/200/eggs?lock=1',
  '100000000014': 'https://loremflickr.com/200/200/milk?lock=1',
  '100000000015': 'https://loremflickr.com/200/200/toothpaste?lock=1',
  '100000000016': 'https://loremflickr.com/200/200/dove+soap?lock=1',
  '100000000017': 'https://loremflickr.com/200/200/shampoo?lock=1',
  '100000000018': 'https://loremflickr.com/200/200/razors?lock=1',
  '100000000019': 'https://images.pexels.com/photos/22588872/pexels-photo-22588872.jpeg',
};

async function update() {
    try {
        console.log('Updating images to realistic photos...');
        for (const [barcode, url] of Object.entries(images)) {
            const [updatedCount] = await Product.update({ image: url }, { where: { barcode } });
            if (updatedCount === 0) {
                console.warn(`No product found for barcode ${barcode}`);
            } else {
                console.log(`Updated image for barcode ${barcode}`);
            }
        }
        console.log("Images updated successfully!");
        process.exit(0);
    } catch(e) {
        console.error("Error updating images", e);
        process.exit(1);
    }
}

update();
