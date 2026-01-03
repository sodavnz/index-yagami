import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Hương Vị Ramen',
      subtitle: 'Chính Hiệu Nhật Bản',
      description: 'Trải nghiệm hương vị đậm đà từ nước dùng hầm 12 giờ',
      label: 'Đặc Sản Nhật Bản',
      image: 'https://readdy.ai/api/search-image?query=A%20steaming%20hot%20bowl%20of%20authentic%20Japanese%20ramen%20with%20rich%20tonkotsu%20broth%2C%20perfectly%20cooked%20noodles%2C%20sliced%20chashu%20pork%2C%20soft-boiled%20egg%2C%20green%20onions%2C%20and%20nori%20seaweed%2C%20photographed%20from%20a%2045-degree%20angle%20with%20dramatic%20steam%20rising%2C%20warm%20lighting%20highlighting%20the%20golden%20broth%2C%20minimalist%20clean%20white%20background%2C%20professional%20food%20photography%20style%2C%20appetizing%20and%20inviting%20presentation&width=1920&height=1080&seq=hero1&orientation=landscape'
    },
    {
      title: 'Nghệ Thuật Ẩm Thực',
      subtitle: 'Từ Xứ Sở Hoa Anh Đào',
      description: 'Mỗi bát ramen là một tác phẩm nghệ thuật được chế biến tỉ mỉ',
      label: 'Tinh Hoa Nhật Bản',
      image: 'https://readdy.ai/api/search-image?query=Close-up%20of%20chef%20hands%20carefully%20preparing%20authentic%20Japanese%20ramen%20with%20fresh%20ingredients%2C%20artistic%20composition%20showing%20the%20craftsmanship%20of%20ramen%20making%2C%20warm%20ambient%20lighting%20in%20traditional%20Japanese%20restaurant%20setting%2C%20shallow%20depth%20of%20field%20focusing%20on%20the%20preparation%20process%2C%20clean%20minimalist%20aesthetic%2C%20professional%20culinary%20photography&width=1920&height=1080&seq=hero2&orientation=landscape'
    },
    {
      title: 'Không Gian Ấm Cúng',
      subtitle: 'Phong Cách Nhật Bản',
      description: 'Thưởng thức món ăn trong không gian truyền thống Nhật Bản',
      label: 'Trải Nghiệm Độc Đáo',
      image: 'https://readdy.ai/api/search-image?query=Cozy%20modern%20Japanese%20ramen%20restaurant%20interior%20with%20warm%20wooden%20elements%2C%20traditional%20paper%20lanterns%2C%20comfortable%20seating%20arrangement%2C%20soft%20ambient%20lighting%20creating%20intimate%20atmosphere%2C%20minimalist%20Japanese%20design%20aesthetic%2C%20clean%20and%20inviting%20space%2C%20professional%20interior%20photography%20with%20warm%20color%20tones&width=1920&height=1080&seq=hero3&orientation=landscape'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="home" className="relative h-screen mt-20 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 w-full h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30"></div>

          <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
            <div className="w-full max-w-2xl">
              <span className="inline-block bg-white/90 text-[#E84118] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {slide.label}
              </span>
              <h1 className="text-7xl font-extrabold text-white mb-4 leading-tight">
                {slide.title}
                <br />
                {slide.subtitle}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                {slide.description}
              </p>
              <button className="inline-flex items-center gap-3 bg-[#E84118] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d63910] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap">
                Khám Phá Thực Đơn
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all cursor-pointer"
      >
        <i className="ri-arrow-left-line text-xl"></i>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all cursor-pointer"
      >
        <i className="ri-arrow-right-line text-xl"></i>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all cursor-pointer ${
              index === currentSlide
                ? 'w-12 h-2 bg-[#E84118] rounded-full'
                : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
