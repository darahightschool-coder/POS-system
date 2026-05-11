const { Product, Category } = require("./models");

const generateProducts = (categories) => {
  let catMap = {};
  categories.forEach((c) => (catMap[c.name.toLowerCase()] = c.id));
  const getCatId = (name) => catMap[name.toLowerCase()] || categories[0].id;

  return [
    {
      name: "Coca Cola 2L",
      categoryId: getCatId("beverages"),
      price: 2.5,
      costPrice: 1.0,
      stock: 150,
      image: "https://placehold.co/200x200/D32F2F/FFFFFF?text=Coca+Cola",
    },
    {
      name: "Pepsi 2L",
      categoryId: getCatId("beverages"),
      price: 2.5,
      costPrice: 1.0,
      stock: 120,
      image: "https://placehold.co/200x200/1976D2/FFFFFF?text=Pepsi",
    },
    {
      name: "Sprite 2L",
      categoryId: getCatId("beverages"),
      price: 2.5,
      costPrice: 1.0,
      stock: 100,
      image: "https://placehold.co/200x200/388E3C/FFFFFF?text=Sprite",
    },
    {
      name: "Red Bull Energy 250ml",
      categoryId: getCatId("beverages"),
      price: 3.5,
      costPrice: 2.0,
      stock: 80,
      image: "https://placehold.co/200x200/FBC02D/000000?text=Red+Bull",
    },
    {
      name: "Monster Energy 500ml",
      categoryId: getCatId("beverages"),
      price: 3.0,
      costPrice: 1.5,
      stock: 65,
      image: "https://placehold.co/200x200/000000/388E3C?text=Monster",
    },

    {
      name: "Lays Classic Chips",
      categoryId: getCatId("snacks"),
      price: 1.99,
      costPrice: 0.8,
      stock: 200,
      image: "https://placehold.co/200x200/FBC02D/000000?text=Lays+Classic",
    },
    {
      name: "Doritos Nacho Cheese",
      categoryId: getCatId("snacks"),
      price: 2.29,
      costPrice: 0.9,
      stock: 180,
      image: "https://placehold.co/200x200/D32F2F/FFFFFF?text=Doritos",
    },
    {
      name: "Pringles Original",
      categoryId: getCatId("snacks"),
      price: 2.5,
      costPrice: 1.1,
      stock: 120,
      image: "https://placehold.co/200x200/D32F2F/FFFFFF?text=Pringles",
    },
    {
      name: "Snickers Bar",
      categoryId: getCatId("snacks"),
      price: 1.2,
      costPrice: 0.5,
      stock: 300,
      image: "https://placehold.co/200x200/5D4037/FFFFFF?text=Snickers",
    },
    {
      name: "M&Ms Peanut",
      categoryId: getCatId("snacks"),
      price: 1.4,
      costPrice: 0.6,
      stock: 250,
      image: "https://placehold.co/200x200/FBC02D/000000?text=M%26Ms",
    },

    {
      name: "Fresh Apples 1kg",
      categoryId: getCatId("groceries"),
      price: 4.5,
      costPrice: 2.5,
      stock: 50,
      image: "https://placehold.co/200x200/D32F2F/FFFFFF?text=Apples",
    },
    {
      name: "Bananas 1kg",
      categoryId: getCatId("groceries"),
      price: 2.0,
      costPrice: 1.0,
      stock: 60,
      image: "https://placehold.co/200x200/FBC02D/000000?text=Bananas",
    },
    {
      name: "Whole Wheat Bread",
      categoryId: getCatId("groceries"),
      price: 3.5,
      costPrice: 1.5,
      stock: 40,
      image: "https://placehold.co/200x200/8D6E63/FFFFFF?text=Bread",
    },
    {
      name: "Grade A Eggs (Dozen)",
      categoryId: getCatId("groceries"),
      price: 4.29,
      costPrice: 2.0,
      stock: 80,
      image: "https://placehold.co/200x200/FFFFFF/000000?text=Eggs",
    },
    {
      name: "Whole Milk 1L",
      categoryId: getCatId("groceries"),
      price: 2.5,
      costPrice: 1.2,
      stock: 100,
      image: "https://placehold.co/200x200/E0E0E0/000000?text=Milk",
    },

    {
      name: "Colgate Toothpaste",
      categoryId: getCatId("personal care"),
      price: 3.99,
      costPrice: 1.8,
      stock: 150,
      image: "https://placehold.co/200x200/D32F2F/FFFFFF?text=Colgate",
    },
    {
      name: "Dove Body Wash",
      categoryId: getCatId("personal care"),
      price: 6.5,
      costPrice: 3.0,
      stock: 90,
      image: "https://placehold.co/200x200/1976D2/FFFFFF?text=Dove",
    },
    {
      name: "Head & Shoulders Shampoo",
      categoryId: getCatId("personal care"),
      price: 7.99,
      costPrice: 4.0,
      stock: 80,
      image: "https://placehold.co/200x200/1976D2/FFFFFF?text=H%26S+Shampoo",
    },
    {
      name: "soudal Hand Sanitizer 500ml",
      categoryId: getCatId("personal care"),
      price: 12.5,
      costPrice: 7.0,
      stock: 60,
      image:
        "https://images.pexels.com/photos/37271678/pexels-photo-37271678.jpeg",
    },
    {
      name: "Coffee ",
      categoryId: getCatId("personal care"),
      price: 5.99,
      costPrice: 2.5,
      stock: 110,
      image:
        "https://images.pexels.com/photos/22588872/pexels-photo-22588872.jpeg",
    },
  ];
};

async function runSeed() {
  try {
    console.log("Connecting to database...");
    const categories = await Category.findAll();
    if (categories.length === 0) {
      console.log("No categories found. Creating defaults...");
      await Category.bulkCreate([
        { name: "Groceries", color: "#4CAF50", icon: "fa-apple-whole" },
        { name: "Beverages", color: "#2196F3", icon: "fa-bottle-water" },
        { name: "Snacks", color: "#FF9800", icon: "fa-cookie" },
        { name: "Personal Care", color: "#9C27B0", icon: "fa-pump-soap" },
      ]);
    }

    const finalCategories = await Category.findAll();
    const products = generateProducts(finalCategories);

    for (let i = 0; i < products.length; i++) {
      products[i].barcode = "1000000000" + i;
    }

    console.log("Syncing 20 products...");
    await Product.bulkCreate(products, {
      updateOnDuplicate: [
        "name",
        "categoryId",
        "price",
        "costPrice",
        "stock",
        "image",
        "updatedAt",
      ],
    });
    console.log("Successfully synced 20 products!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
}

runSeed();
