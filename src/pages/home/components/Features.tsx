export default function Features() {
  const features = [
    {
      icon: 'ri-leaf-line',
      title: '100% Nguyên Liệu Tươi',
      description: 'Nhập khẩu trực tiếp từ Nhật Bản, đảm bảo độ tươi ngon tuyệt đối cho mỗi bát ramen'
    },
    {
      icon: 'ri-restaurant-line',
      title: 'Công Thức Truyền Thống',
      description: 'Nước dùng được hầm trong 12 giờ theo công thức gia truyền từ Nhật Bản'
    },
    {
      icon: 'ri-heart-line',
      title: 'Phục Vụ Tận Tâm',
      description: 'Đội ngũ nhân viên chuyên nghiệp, nhiệt tình, mang đến trải nghiệm tuyệt vời nhất'
    },
    {
      icon: 'ri-time-line',
      title: 'Phục Vụ Nhanh Chóng',
      description: 'Cam kết phục vụ món ăn trong thời gian ngắn nhất, đảm bảo độ nóng và tươi ngon'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'An Toàn Vệ Sinh',
      description: 'Quy trình chế biến đạt chuẩn HACCP, đảm bảo an toàn thực phẩm tuyệt đối'
    },
    {
      icon: 'ri-star-line',
      title: 'Đánh Giá 5 Sao',
      description: 'Hơn 5000 khách hàng hài lòng với chất lượng món ăn và dịch vụ của chúng tôi'
    }
  ];

  return (
    <section className="py-24 bg-[#FFF8E7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Tại Sao Chọn Chúng Tôi</p>
          <h2 className="text-6xl font-bold text-[#1A1A1A] leading-tight">
            Cam Kết Chất Lượng
            <br />
            Hàng Đầu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#FFFBF0] rounded-2xl p-10 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-6">
                <i className={`${feature.icon} text-5xl text-[#E84118]`}></i>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">{feature.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
