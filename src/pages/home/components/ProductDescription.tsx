export default function ProductDescription() {
  const products = [
    {
      name: 'Ramen Tonkotsu Đặc Biệt',
      description: 'Nước dùng xương heo hầm 12 giờ, thịt xá xíu mềm, trứng lòng đào',
      price: '129.000đ',
      image: 'https://readdy.ai/api/search-image?query=Premium%20tonkotsu%20ramen%20in%20elegant%20white%20bowl%20with%20rich%20creamy%20pork%20bone%20broth%2C%20tender%20chashu%20pork%20slices%2C%20perfectly%20soft-boiled%20egg%20with%20runny%20yolk%2C%20fresh%20green%20onions%2C%20bamboo%20shoots%2C%20nori%20seaweed%2C%20photographed%20from%20above%20on%20clean%20white%20surface%2C%20professional%20food%20photography%20with%20natural%20lighting%2C%20appetizing%20presentation%20with%20steam%20effect%2C%20minimalist%20Japanese%20aesthetic&width=800&height=1000&seq=product1&orientation=portrait',
      badge: 'Bán Chạy'
    },
    {
      name: 'Ramen Miso Truyền Thống',
      description: 'Nước dùng miso đậm đà, rau củ tươi ngon, thịt heo áp chảo',
      price: '119.000đ',
      image: 'https://readdy.ai/api/search-image?query=Traditional%20miso%20ramen%20in%20white%20ceramic%20bowl%20with%20rich%20brown%20miso%20broth%2C%20stir-fried%20pork%20slices%2C%20fresh%20vegetables%20including%20corn%20and%20bean%20sprouts%2C%20green%20onions%2C%20soft-boiled%20egg%2C%20photographed%20from%2045-degree%20angle%20on%20white%20background%2C%20professional%20food%20photography%20with%20warm%20lighting%2C%20authentic%20Japanese%20presentation%20style%2C%20minimalist%20clean%20aesthetic&width=800&height=1000&seq=product2&orientation=portrait',
      badge: 'Đặc Biệt'
    },
    {
      name: 'Ramen Hải Sản Cao Cấp',
      description: 'Tôm, mực, nghêu tươi sống, nước dùng hải sản thanh ngọt',
      price: '149.000đ',
      image: 'https://readdy.ai/api/search-image?query=Premium%20seafood%20ramen%20in%20elegant%20white%20bowl%20with%20clear%20seafood%20broth%2C%20fresh%20shrimp%2C%20squid%2C%20clams%2C%20seaweed%2C%20green%20onions%2C%20soft-boiled%20egg%2C%20photographed%20from%20above%20on%20clean%20white%20surface%2C%20professional%20food%20photography%20with%20bright%20natural%20lighting%2C%20luxurious%20presentation%2C%20fresh%20ingredients%20visible%2C%20minimalist%20Japanese%20style%20aesthetic&width=800&height=1000&seq=product3&orientation=portrait',
      badge: 'Cao Cấp'
    }
  ];

  return (
    <section id="menu" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-7xl font-semibold text-[#1A1A1A] leading-tight font-serif">
            Thực Đơn
            <br />
            Đặc Biệt
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
          {products.map((product, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative w-full h-96 bg-white overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-[#E84118] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif font-semibold text-[#1A1A1A] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#E84118]">{product.price}</span>
                  <button className="w-10 h-10 flex items-center justify-center bg-[#E84118] text-white rounded-full hover:bg-[#d63910] hover:scale-110 transition-all cursor-pointer">
                    <i className="ri-shopping-cart-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-[#FFF8E7] rounded-3xl p-16">
            <div className="max-w-xl">
              <h3 className="text-4xl font-bold text-[#1A1A1A] mb-6">
                Câu Chuyện Thương Hiệu
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Được thành lập từ năm 2020, chúng tôi mang đến hương vị ramen chính hiệu Nhật Bản với công thức độc quyền được truyền trao qua nhiều thế hệ. Mỗi bát ramen là sự kết hợp hoàn hảo giữa nghệ thuật ẩm thực truyền thống và sự tận tâm trong từng chi tiết.
              </p>
              <button className="inline-flex items-center gap-2 bg-[#4CD964] text-[#1A1A1A] px-8 py-4 rounded-full font-semibold hover:bg-[#3bc252] hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
                Tìm Hiểu Thêm
                <i className="ri-arrow-right-line"></i>
              </button>
              <div className="flex items-center gap-20 mt-16">
                <div>
                  <div className="text-5xl font-bold text-[#1A1A1A] mb-2">5000+</div>
                  <div className="text-sm text-gray-600">Khách Hàng Hài Lòng</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-[#1A1A1A] mb-2">15+</div>
                  <div className="text-sm text-gray-600">Năm Kinh Nghiệm</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=Cozy%20warm%20Japanese%20ramen%20restaurant%20interior%20with%20traditional%20wooden%20elements%2C%20soft%20ambient%20lighting%2C%20comfortable%20seating%20area%2C%20modern%20minimalist%20design%20with%20Japanese%20aesthetic%2C%20customers%20enjoying%20meals%20in%20background%2C%20warm%20inviting%20atmosphere%2C%20professional%20interior%20photography%20with%20natural%20warm%20tones%2C%20clean%20and%20elegant%20space&width=800&height=1000&seq=about1&orientation=portrait"
                alt="Không gian nhà hàng"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-[#1A1A1A]">
                  Hà Nội, Việt Nam
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-3xl font-bold mb-2">Không Gian Ấm Cúng</div>
                <div className="text-lg">Phong Cách Nhật Bản</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
