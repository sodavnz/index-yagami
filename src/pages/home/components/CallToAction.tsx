export default function CallToAction() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-6xl font-bold text-[#1A1A1A] mb-4">
          Đặt Bàn Ngay Hôm Nay
        </h2>
        <p className="text-xl text-gray-500 mb-10">
          Trải nghiệm ẩm thực Nhật Bản đích thực tại Việt Nam
        </p>
        <button className="inline-flex items-center gap-3 bg-[#6F4E37] text-white px-12 py-5 rounded-full text-lg font-semibold hover:bg-[#5d3e2b] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap">
          Đặt Bàn Ngay
          <i className="ri-arrow-right-line text-xl"></i>
        </button>

        <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="https://readdy.ai/api/search-image?query=Single%20bowl%20of%20steaming%20hot%20ramen%20with%20visible%20steam%20rising%2C%20isolated%20on%20pure%20white%20background%2C%20professional%20product%20photography%2C%20clean%20minimalist%20style%2C%20top-down%20view%2C%20high%20quality%20food%20photography&width=300&height=300&seq=cta1&orientation=squarish"
              alt="Ramen"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="https://readdy.ai/api/search-image?query=Pair%20of%20wooden%20chopsticks%20placed%20elegantly%2C%20isolated%20on%20pure%20white%20background%2C%20professional%20product%20photography%2C%20clean%20minimalist%20style%2C%20simple%20composition%2C%20high%20quality%20photography&width=300&height=300&seq=cta2&orientation=squarish"
              alt="Đũa"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="https://readdy.ai/api/search-image?query=Fresh%20vegetables%20including%20green%20onions%20and%20bamboo%20shoots%20arranged%20artistically%2C%20isolated%20on%20pure%20white%20background%2C%20professional%20product%20photography%2C%20clean%20minimalist%20style%2C%20vibrant%20colors%2C%20high%20quality%20food%20photography&width=300&height=300&seq=cta3&orientation=squarish"
              alt="Rau củ"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="https://readdy.ai/api/search-image?query=Perfect%20soft-boiled%20egg%20with%20runny%20yolk%20cut%20in%20half%2C%20isolated%20on%20pure%20white%20background%2C%20professional%20product%20photography%2C%20clean%20minimalist%20style%2C%20appetizing%20presentation%2C%20high%20quality%20food%20photography&width=300&height=300&seq=cta4&orientation=squarish"
              alt="Trứng"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
