class Product {
  final String id;
  final String title;
  final String weight;
  final double price;
  final double originalPrice;
  final String category;
  final String imageUrl;
  final int stock;

  Product({
    required this.id,
    required this.title,
    required this.weight,
    required this.price,
    required this.originalPrice,
    required this.category,
    required this.imageUrl,
    this.stock = 50,
  });

  int get discountPercent {
    if (originalPrice > price) {
      return (((originalPrice - price) / originalPrice) * 100).round();
    }
    return 0;
  }
}

class ProductCatalog {
  static final List<String> categories = [
    'All',
    'Dairy & Breakfast',
    'Snacks & Munchies',
    'Cold Drinks',
    'Instant Food',
    'Bakery & Biscuits',
    'Fresh Fruits'
  ];

  static final List<Product> sampleProducts = [
    Product(
      id: 'p1',
      title: 'Amul Taaza Fresh Toned Milk',
      weight: '500 ml',
      price: 27.0,
      originalPrice: 28.0,
      category: 'Dairy & Breakfast',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      stock: 45,
    ),
    Product(
      id: 'p2',
      title: "Lay's Classic Salted Potato Chips",
      weight: '50 g',
      price: 20.0,
      originalPrice: 20.0,
      category: 'Snacks & Munchies',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
      stock: 60,
    ),
    Product(
      id: 'p3',
      title: 'Coca-Cola Zero Sugar Soda Can',
      weight: '300 ml',
      price: 40.0,
      originalPrice: 45.0,
      category: 'Cold Drinks',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
      stock: 35,
    ),
    Product(
      id: 'p4',
      title: 'Britannia 100% Whole Wheat Bread',
      weight: '400 g',
      price: 45.0,
      originalPrice: 50.0,
      category: 'Bakery & Biscuits',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
      stock: 25,
    ),
    Product(
      id: 'p5',
      title: 'Maggi 2-Minute Masala Instant Noodles',
      weight: '70 g (Pack of 4)',
      price: 56.0,
      originalPrice: 60.0,
      category: 'Instant Food',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400',
      stock: 40,
    ),
    Product(
      id: 'p6',
      title: 'Farm Fresh Robusta Bananas',
      weight: '1 kg (5-6 pcs)',
      price: 48.0,
      originalPrice: 60.0,
      category: 'Fresh Fruits',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      stock: 20,
    ),
    Product(
      id: 'p7',
      title: 'Cadbury Dairy Milk Silk Chocolate',
      weight: '60 g',
      price: 80.0,
      originalPrice: 85.0,
      category: 'Snacks & Munchies',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
      stock: 30,
    ),
    Product(
      id: 'p8',
      title: 'Epigamia Greek Yogurt (Wild Blueberry)',
      weight: '90 g',
      price: 60.0,
      originalPrice: 65.0,
      category: 'Dairy & Breakfast',
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      stock: 15,
    ),
  ];
}
