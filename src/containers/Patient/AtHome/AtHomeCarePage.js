import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import "./AtHomeCarePage.scss";

// Danh mục dịch vụ
const CATEGORIES = [
  { key: "ALL", label: "Tất cả dịch vụ", icon: "fa-th-large" },
  { key: "DOCTOR", label: "Bác sĩ khám tại nhà", icon: "fa-user-md" },
  { key: "TESTING", label: "Xét nghiệm tại nhà", icon: "fa-flask" },
  { key: "NURSING", label: "Điều dưỡng & Chăm sóc", icon: "fa-heartbeat" },
  { key: "PHYSIO", label: "Vật lý trị liệu & PHCN", icon: "fa-wheelchair" },
  { key: "MOTHER_BABY", label: "Chăm sóc Mẹ & Bé", icon: "fa-child" },
];

// Khung giờ phục vụ tại nhà
const TIME_SLOTS = [
  { key: "S1", label: "07:00 - 08:30", period: "Sáng" },
  { key: "S2", label: "08:30 - 10:00", period: "Sáng" },
  { key: "S3", label: "10:00 - 11:30", period: "Sáng" },
  { key: "C1", label: "13:30 - 15:00", period: "Chiều" },
  { key: "C2", label: "15:00 - 16:30", period: "Chiều" },
  { key: "C3", label: "16:30 - 18:00", period: "Chiều" },
  { key: "T1", label: "18:00 - 19:30", period: "Tối" },
  { key: "T2", label: "19:30 - 21:00", period: "Tối" },
];

// Dữ liệu dịch vụ tại nhà phong phú và chuyên nghiệp
const AT_HOME_SERVICES = [
  {
    id: "AH-01",
    name: "Bác sĩ Nội khoa Tổng quát khám tại nhà",
    category: "DOCTOR",
    categoryName: "Bác sĩ khám tại nhà",
    badge: "Bác sĩ giỏi",
    badgeColor: "#1a73e8",
    price: 450000,
    originalPrice: 550000,
    duration: "45 - 60 phút",
    rating: 4.9,
    reviewsCount: 320,
    icon: "fa-stethoscope",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    shortDesc: "Thăm khám trực tiếp bởi Bác sĩ chuyên khoa Nội: kiểm tra tim phổi, đo huyết áp, chẩn đoán, kê đơn thuốc và tư vấn phác đồ điều trị tận nơi.",
    inclusions: [
      "Khám tổng thể lâm sàng tim mạch, hô hấp, tiêu hóa",
      "Đo huyết áp, chỉ số SpO2, đường huyết mao mạch nhanh",
      "Kê đơn thuốc điện tử và hướng dẫn chăm sóc chi tiết",
      "Bác sĩ theo dõi tình trạng qua điện thoại sau khám 48h",
    ],
    targetAudience: "Người lớn tuổi đi lại khó khăn, người có bệnh mãn tính, cảm sốt, mệt mỏi.",
    preparation: "Chuẩn bị các kết quả xét nghiệm, đơn thuốc cũ (nếu có). Nghỉ ngơi 15 phút trước khi bác sĩ đo huyết áp.",
  },
  {
    id: "AH-02",
    name: "Bác sĩ Nhi khoa thăm khám cho bé tại nhà",
    category: "DOCTOR",
    categoryName: "Bác sĩ khám tại nhà",
    badge: "Yêu thích nhất",
    badgeColor: "#ea580c",
    price: 400000,
    originalPrice: 500000,
    duration: "40 - 50 phút",
    rating: 5.0,
    reviewsCount: 412,
    icon: "fa-user-nurse",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    shortDesc: "Bác sĩ chuyên khoa Nhi thân thiện, giàu kinh nghiệm khám sốt, ho, viêm đường hô hấp, tiêu hóa và phát ban cho trẻ tại không gian quen thuộc.",
    inclusions: [
      "Khám tai mũi họng bằng đèn soi y tế chuyên dụng",
      "Khám nghe tim phổi, kiểm tra nhu động bụng và phản xạ",
      "Đánh giá tăng trưởng chiều cao, cân nặng, dinh dưỡng",
      "Kê đơn thuốc an toàn theo cân nặng lứa tuổi",
    ],
    targetAudience: "Trẻ sơ sinh đến 15 tuổi có dấu hiệu sốt, quấy khóc, ho khò khè, rối loạn tiêu hóa.",
    preparation: "Ghi lại nhiệt độ sốt của bé, các loại thuốc bé đã uống trong 24 giờ qua.",
  },
  {
    id: "AH-03",
    name: "Xét nghiệm Máu tổng quát 18 chỉ số tại nhà",
    category: "TESTING",
    categoryName: "Xét nghiệm tại nhà",
    badge: "Gói bán chạy",
    badgeColor: "#16a34a",
    price: 590000,
    originalPrice: 750000,
    duration: "15 - 20 phút lấy mẫu",
    rating: 4.9,
    reviewsCount: 685,
    icon: "fa-vial",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    shortDesc: "Kỹ thuật viên đến tận nhà lấy máu và nước tiểu vô khuẩn. Phân tích tại phòng lab chuẩn ISO 15189, trả kết quả online qua App/Zalo trong 4-6h.",
    inclusions: [
      "Tổng phân tích tế bào máu ngoại vi 18 thông số",
      "Kiểm tra chức năng Gan (AST, ALT, GGT)",
      "Đánh giá chức năng Thận (Ure, Creatinin máu)",
      "Định lượng Đường huyết đói (Glucose)",
      "Bộ mỡ máu toàn phần (Cholesterol, Triglycerid, HDL, LDL)",
      "Bác sĩ gọi điện tư vấn kết quả hoàn toàn miễn phí",
    ],
    targetAudience: "Người cần kiểm tra sức khỏe định kỳ, tầm soát bệnh mỡ máu, tiểu đường, gan thận.",
    preparation: "Nhịn ăn từ 6 - 8 tiếng trước khi lấy mẫu máu (chỉ được uống nước lọc).",
  },
  {
    id: "AH-04",
    name: "Xét nghiệm Chức năng Tuyến Giáp tại nhà",
    category: "TESTING",
    categoryName: "Xét nghiệm tại nhà",
    badge: "Tiết kiệm 20%",
    badgeColor: "#9333ea",
    price: 380000,
    originalPrice: 480000,
    duration: "15 phút",
    rating: 4.8,
    reviewsCount: 198,
    icon: "fa-dna",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    shortDesc: "Tầm soát và theo dõi bệnh lý cường giáp, suy giáp, bướu giáp qua 3 chỉ số nội tiết tố tuyến giáp quan trọng: TSH, FT3, FT4.",
    inclusions: [
      "Định lượng Hormone kích thích tuyến giáp TSH",
      "Định lượng Free T3 (FT3)",
      "Định lượng Free T4 (FT4)",
      "Kỹ thuật viên lấy máu nhẹ nhàng, không sưng bầm",
      "Kết quả gửi về Zalo/App kèm phân tích của Bác sĩ",
    ],
    targetAudience: "Người có biểu hiện run tay, hồi hộp, sụt cân bất thường, rụng tóc hoặc có tiền sử bệnh lý tuyến giáp.",
    preparation: "Có thể ăn nhẹ, không cần nhịn đói khắt khe.",
  },
  {
    id: "AH-05",
    name: "Dịch vụ Tiêm thuốc & Truyền dịch tại nhà theo y lệnh",
    category: "NURSING",
    categoryName: "Điều dưỡng & Chăm sóc",
    badge: "Chuẩn y khoa",
    badgeColor: "#0284c7",
    price: 250000,
    originalPrice: 320000,
    duration: "60 - 90 phút",
    rating: 4.9,
    reviewsCount: 520,
    icon: "fa-syringe",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    shortDesc: "Điều dưỡng chính quy thực hiện tiêm bắp, tiêm tĩnh mạch hoặc truyền dịch bổ sung nước điện giải, vitamin theo đúng chỉ định bác sĩ.",
    inclusions: [
      "Đo dấu hiệu sinh tồn (huyết áp, mạch, nhiệt độ, SpO2) trước và sau truyền",
      "Dụng cụ kim tiêm, dây truyền dịch vô khuẩn 1 lần",
      "Điều dưỡng túc trực 100% thời gian theo dõi sát phản ứng dịch truyền",
      "Hộp chống sốc phản vệ đạt chuẩn Bộ Y tế luôn mang theo",
    ],
    targetAudience: "Bệnh nhân suy nhược, mất nước do ngộ độc/tiêu chảy, bệnh nhân cần dùng kháng sinh tiêm truyền theo đơn.",
    preparation: "Cần có sẵn đơn thuốc hoặc chỉ định của bác sĩ điều trị.",
  },
  {
    id: "AH-06",
    name: "Dịch vụ Thay băng, Rửa vết thương & Cắt chỉ tại nhà",
    category: "NURSING",
    categoryName: "Điều dưỡng & Chăm sóc",
    badge: "Nhẹ nhàng - An toàn",
    badgeColor: "#d97706",
    price: 180000,
    originalPrice: 240000,
    duration: "30 - 40 phút",
    rating: 5.0,
    reviewsCount: 388,
    icon: "fa-band-aid",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    shortDesc: "Chăm sóc vết mổ sau phẫu thuật, vết loét tì đè ở người già, vết bỏng hoặc chấn thương. Đảm bảo vô trùng tuyệt đối, giúp vết thương mau lành sẹo.",
    inclusions: [
      "Sát khuẩn bằng dung dịch y tế chuyên dụng (Betadine, NaCl 0.9%)",
      "Làm sạch giả mạc, dẫn lưu dịch ứ đọng (nếu có)",
      "Băng ép hoặc gạc vô trùng chống dính cao cấp",
      "Cắt chỉ đúng ngày theo chỉ định, không gây đau buốt",
    ],
    targetAudience: "Bệnh nhân sau phẫu thuật xuất viện về nhà, người cao tuổi loét tì đè do nằm liệt.",
    preparation: "Để sẵn bông băng gạc hoặc hồ sơ xuất viện (nếu có).",
  },
  {
    id: "AH-07",
    name: "Vật lý trị liệu Phục hồi chức năng Sau Tai biến / Đột quỵ",
    category: "PHYSIO",
    categoryName: "Vật lý trị liệu & PHCN",
    badge: "Chuyên gia PHCN",
    badgeColor: "#e11d48",
    price: 380000,
    originalPrice: 480000,
    duration: "60 phút / buổi",
    rating: 4.9,
    reviewsCount: 260,
    icon: "fa-walking",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    shortDesc: "Kỹ thuật viên Vật lý trị liệu hướng dẫn các bài tập vận động cơ bắp, khớp, kích hoạt phản xạ thần kinh và tái rèn luyện khả năng đứng đi, sinh hoạt.",
    inclusions: [
      "Khám lượng giá cơ lực, trương lực cơ và tầm vận động khớp",
      "Kỹ thuật tập vận động thụ động và chủ động có trợ giúp",
      "Tập thăng bằng ngồi, đứng và dáng đi chuẩn",
      "Hướng dẫn người nhà cách nâng đỡ, xoay trở phòng loét",
    ],
    targetAudience: "Người sau tai biến mạch máu não, liệt nửa người, di chứng chấn thương sọ não.",
    preparation: "Mặc quần áo rộng rãi, thoáng mát, tập sau ăn ít nhất 45 phút.",
  },
  {
    id: "AH-08",
    name: "Trị liệu Giảm đau Cổ Vai Gáy & Thoát vị đĩa đệm tại nhà",
    category: "PHYSIO",
    categoryName: "Vật lý trị liệu & PHCN",
    badge: "Giảm đau nhanh",
    badgeColor: "#2563eb",
    price: 320000,
    originalPrice: 400000,
    duration: "50 phút",
    rating: 4.9,
    reviewsCount: 342,
    icon: "fa-hand-holding-medical",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    shortDesc: "Liệu trình xoa bóp, bấm huyệt trị liệu kết hợp máy điện xung di động giúp giải phóng chèn ép rễ thần kinh, dứt điểm cơn co cứng cổ vai gáy và đau lưng.",
    inclusions: [
      "Thăm khám điểm co thắt cơ và chèn ép dây thần kinh tọa",
      "Trị liệu bằng tay chuyên sâu (Massage Y học & Nắn chỉnh cơ)",
      "Chạy máy xung điện tần số thấp giảm đau tức thì",
      "Hướng dẫn bài tập tư thế chuẩn phòng ngừa tái phát",
    ],
    targetAudience: "Dân văn phòng ngồi nhiều, người bị thoái hóa đốt sống cổ, thắt lưng, đau thần kinh tọa.",
    preparation: "Không mang trang sức quanh cổ hoặc thắt lưng trong lúc trị liệu.",
  },
  {
    id: "AH-09",
    name: "Dịch vụ Tắm bé Sơ sinh & Chăm sóc Rốn chuẩn Y khoa",
    category: "MOTHER_BABY",
    categoryName: "Chăm sóc Mẹ & Bé",
    badge: "100% Nữ hộ sinh",
    badgeColor: "#ec4899",
    price: 160000,
    originalPrice: 220000,
    duration: "40 - 50 phút",
    rating: 5.0,
    reviewsCount: 780,
    icon: "fa-baby",
    gradient: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
    shortDesc: "Nữ hộ sinh nhiều năm kinh nghiệm tại các bệnh viện phụ sản đến tắm mát cho bé, massage kích hoạt giác quan, vệ sinh mắt mũi miệng và chăm sóc rốn an toàn.",
    inclusions: [
      "Massage body toàn thân cho bé giúp ngủ sâu giấc, giảm đầy hơi",
      "Tắm bé khoa học với nhiệt độ nước chuẩn 37-38°C",
      "Vệ sinh cuống rốn vô khuẩn, phát hiện sớm dấu hiệu nhiễm trùng",
      "Vệ sinh mắt, mũi, rơ lưỡi sạch sẽ",
      "Tư vấn mẹ bỉm sữa cách nhận biết da vàng, cách bế bú đúng khớp",
    ],
    targetAudience: "Bé sơ sinh từ ngày xuất viện đến 3 tháng tuổi.",
    preparation: "Chuẩn bị chậu tắm, nước ấm, khăn tắm và quần áo sạch cho bé.",
  },
  {
    id: "AH-10",
    name: "Thông tắc Tia sữa Bằng Máy Siêu Âm Đa Tần Không Đau",
    category: "MOTHER_BABY",
    categoryName: "Chăm sóc Mẹ & Bé",
    badge: "Cấp tốc 24/7",
    badgeColor: "#be185d",
    price: 350000,
    originalPrice: 450000,
    duration: "60 phút",
    rating: 4.9,
    reviewsCount: 410,
    icon: "fa-female",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
    shortDesc: "Giải pháp điều trị cương sữa, vón cục, tắc tia sữa hiệu quả số 1 bằng sóng siêu âm đa tần hiện đại, êm dịu, không bóp nặn đau đớn, sữa về ngay.",
    inclusions: [
      "Khám phát hiện vị trí nang sữa bị tắc và ổ viêm",
      "Chạy máy siêu âm đa tần làm tan các cục đông kết sâu bên trong",
      "Kỹ thuật đẩy sữa thừa nhẹ nhàng, êm ái",
      "Kích thích tuyến sữa lưu thông tự nhiên, không làm tổn thương đầu ti",
    ],
    targetAudience: "Mẹ sau sinh bị cương cứng bầu ngực, đau nhức, sốt do tắc sữa, sữa chảy nhỏ giọt.",
    preparation: "Uống một cốc nước ấm trước khi chuyên viên đến điều trị.",
  },
  {
    id: "AH-11",
    name: "Đặt / Thay Sonde Dạ dày & Sonde Tiểu tại nhà",
    category: "NURSING",
    categoryName: "Điều dưỡng & Chăm sóc",
    badge: "Kỹ thuật cao",
    badgeColor: "#0f766e",
    price: 350000,
    originalPrice: 450000,
    duration: "40 phút",
    rating: 4.9,
    reviewsCount: 165,
    icon: "fa-procedures",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    shortDesc: "Thực hiện bởi Điều dưỡng viên có thâm niên khoa Hồi sức cấp cứu. Thao tác nhẹ nhàng, chính xác, đảm bảo an toàn tuyệt đối cho người bệnh nặng.",
    inclusions: [
      "Bộ dây sonde mới 100% đạt chuẩn y tế",
      "Sát trùng niêm mạc, bôi trơn gel y tế giảm cảm giác khó chịu",
      "Kiểm tra vị trí ống sonde đúng chuẩn trước khi cố định",
      "Hướng dẫn gia đình cách bơm thức ăn / xả nước tiểu đúng cách",
    ],
    targetAudience: "Bệnh nhân hôn mê, tai biến không tự nuốt được, bí tiểu hoặc sau phẫu thuật niệu đạo.",
    preparation: "Chuẩn bị thức ăn lỏng hoặc túi nước tiểu nếu đã có chỉ định.",
  },
  {
    id: "AH-12",
    name: "Tầm soát Dấu ấn Ung thư Sớm bằng Máu tại nhà",
    category: "TESTING",
    categoryName: "Xét nghiệm tại nhà",
    badge: "Chuyên sâu",
    badgeColor: "#4338ca",
    price: 890000,
    originalPrice: 1150000,
    duration: "15 phút",
    rating: 4.8,
    reviewsCount: 230,
    icon: "fa-microscope",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    shortDesc: "Định lượng nồng độ các kháng nguyên khối u trong máu (AFP - gan, CEA - tiêu hóa, CA 19-9 - tụy, PSA nam / CA 125 nữ) giúp phát hiện sớm nguy cơ ác tính.",
    inclusions: [
      "Định lượng AFP (Tầm soát nguy cơ ung thư Gan)",
      "Định lượng CEA (Tầm soát nguy cơ ung thư Đại trực tràng, tiêu hóa)",
      "Định lượng CA 19-9 (Tầm soát nguy cơ ung thư Dạ dày, Tụy)",
      "Định lượng PSA cho Nam (Tuyến tiền liệt) / CA 125 cho Nữ (Buồng trứng)",
      "Bác sĩ chuyên khoa Ung bướu gọi điện phân tích và tư vấn hướng xử trí",
    ],
    targetAudience: "Người trên 35 tuổi, người có tiền sử gia đình mắc ung thư, người thường xuyên hút thuốc, uống rượu bia.",
    preparation: "Nhịn ăn sáng ít nhất 6 tiếng trước khi lấy mẫu máu.",
  },
];

// Các bước quy trình
const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Đặt lịch trực tuyến",
    desc: "Chọn dịch vụ y tế tại nhà phù hợp, chọn ngày và khung giờ mong muốn chỉ trong 1 phút.",
    icon: "fa-calendar-check-o",
  },
  {
    step: "02",
    title: "Xác nhận & Điều phối",
    desc: "Tổng đài viên BookingCare liên hệ xác nhận và điều phối Bác sĩ / Điều dưỡng gần nhà bạn nhất.",
    icon: "fa-user-md",
  },
  {
    step: "03",
    title: "Thực hiện tận nhà",
    desc: "Y bác sĩ có mặt đúng giờ với trang thiết bị vô khuẩn, tận tình chăm sóc và thăm khám.",
    icon: "fa-home",
  },
  {
    step: "04",
    title: "Nhận kết quả & Tư vấn",
    desc: "Kết quả xét nghiệm, đơn thuốc điện tử được cập nhật trên App/Zalo kèm tư vấn bác sĩ 24/7.",
    icon: "fa-file-text-o",
  },
];

// Câu hỏi thường gặp
const FAQS = [
  {
    q: "Bác sĩ hoặc điều dưỡng đến nhà có mang đầy đủ dụng cụ y tế không?",
    a: "Hoàn toàn có! Tất cả y bác sĩ và điều dưỡng của BookingCare đều được trang bị vali chuyên dụng gồm máy đo huyết áp điện tử, ống nghe tim phổi, máy đo SpO2, máy đo đường huyết mao mạch, nhiệt kế hồng ngoại, hộp chống sốc phản vệ và dụng cụ vô khuẩn dùng 1 lần đạt chuẩn Bộ Y tế.",
  },
  {
    q: "Xét nghiệm tại nhà bao lâu thì nhận được kết quả?",
    a: "Mẫu máu và nước tiểu sau khi lấy được bảo quản trong bình vận chuyển chuyên dụng ở nhiệt độ 2-8°C và chuyển ngay đến phòng xét nghiệm đạt chuẩn ISO 15189. Các chỉ số máu cơ bản có kết quả sau 4 - 6 giờ, được trả qua file PDF bảo mật trên tin nhắn Zalo và ứng dụng BookingCare. Bác sĩ sẽ gọi điện tư vấn chi tiết.",
  },
  {
    q: "Nếu tôi cần đặt lịch khẩn cấp trong ngày thì có được không?",
    a: "Được! BookingCare có mạng lưới y bác sĩ và điều dưỡng túc trực tại các quận/huyện nội thành, có thể có mặt tại nhà quý khách sau 30 - 45 phút kể từ khi xác nhận lịch hẹn.",
  },
  {
    q: "Chi phí dịch vụ tại nhà có bị tính thêm phụ phí xăng xe đi lại không?",
    a: "Giá niêm yết trên BookingCare là giá TRỌN GÓI cho khu vực nội thành (dưới 10km). Hoàn toàn KHÔNG phát sinh bất kỳ khoản phụ phí nào. Quý khách chỉ thanh toán đúng số tiền hiển thị trên đơn đặt lịch.",
  },
  {
    q: "Tôi có thể thanh toán bằng hình thức nào?",
    a: "Quý khách có thể linh hoạt thanh toán bằng Tiền mặt trực tiếp cho nhân viên y tế sau khi hoàn tất dịch vụ, hoặc Chuyển khoản QR ngân hàng nhanh chóng và tiện lợi.",
  },
];

class AtHomeCarePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: "ALL",
      searchKeyword: "",
      selectedService: null,
      isOpenDetailModal: false,
      isOpenBookingModal: false,
      openFaqIndex: null,

      // Form đặt lịch
      patientName: "",
      patientPhone: "",
      patientGender: "M", // M: Nam, F: Nữ
      patientBirthYear: "1990",
      patientAddress: "",
      bookingDate: this.getDefaultDate(),
      bookingSlot: "S2",
      bookingSymptoms: "",
      paymentMethod: "CASH", // CASH hoặc TRANSFER_QR

      // State thành công
      bookingSuccess: false,
      confirmedBookingData: null,
      isSubmitting: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    // Điền sẵn thông tin nếu người dùng đã đăng nhập
    if (this.props.patientInfo) {
      this.setState({
        patientName: this.props.patientInfo.name || this.props.patientInfo.firstName || "",
        patientPhone: this.props.patientInfo.phoneNumber || "",
        patientAddress: this.props.patientInfo.address || "",
      });
    }
  }

  getDefaultDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  handleCategoryChange = (key) => {
    this.setState({ selectedCategory: key });
  };

  handleSearchChange = (e) => {
    this.setState({ searchKeyword: e.target.value });
  };

  handleOpenDetail = (service) => {
    this.setState({
      selectedService: service,
      isOpenDetailModal: true,
    });
  };

  handleCloseDetail = () => {
    this.setState({ isOpenDetailModal: false });
  };

  handleOpenBooking = (service) => {
    this.setState({
      selectedService: service,
      isOpenDetailModal: false,
      isOpenBookingModal: true,
      bookingSuccess: false,
    });
  };

  handleCloseBooking = () => {
    this.setState({
      isOpenBookingModal: false,
      bookingSuccess: false,
    });
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value });
  };

  toggleFaq = (index) => {
    this.setState({
      openFaqIndex: this.state.openFaqIndex === index ? null : index,
    });
  };

  formatCurrency = (num) => {
    if (!num) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    const { patientName, patientPhone, patientAddress, bookingDate, bookingSlot, selectedService, paymentMethod } = this.state;

    if (!patientName.trim()) {
      toast.warning("Vui lòng nhập họ và tên người bệnh!");
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 9) {
      toast.warning("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }
    if (!patientAddress.trim()) {
      toast.warning("Vui lòng cung cấp địa chỉ phục vụ tại nhà cụ thể!");
      return;
    }

    this.setState({ isSubmitting: true });

    // Giả lập gửi thông tin đặt lịch
    setTimeout(() => {
      const bookingCode = "HOME-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const slotObj = TIME_SLOTS.find((s) => s.key === bookingSlot) || TIME_SLOTS[0];

      const confirmedData = {
        bookingCode,
        serviceName: selectedService.name,
        price: selectedService.price,
        patientName,
        patientPhone,
        patientAddress,
        bookingDate,
        slotLabel: slotObj.label,
        paymentMethod: paymentMethod === "CASH" ? "Tiền mặt khi nhận dịch vụ" : "Chuyển khoản QR ngân hàng",
      };

      this.setState({
        isSubmitting: false,
        bookingSuccess: true,
        confirmedBookingData: confirmedData,
      });

      toast.success("Đặt lịch dịch vụ tại nhà thành công! Nhân viên BookingCare sẽ liên hệ xác nhận trong 5-10 phút.");
    }, 800);
  };

  render() {
    const {
      selectedCategory,
      searchKeyword,
      selectedService,
      isOpenDetailModal,
      isOpenBookingModal,
      openFaqIndex,
      patientName,
      patientPhone,
      patientGender,
      patientBirthYear,
      patientAddress,
      bookingDate,
      bookingSlot,
      bookingSymptoms,
      paymentMethod,
      bookingSuccess,
      confirmedBookingData,
      isSubmitting,
    } = this.state;

    // Lọc dịch vụ theo danh mục và từ khóa
    const filteredServices = AT_HOME_SERVICES.filter((item) => {
      const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchKeyword =
        !searchKeyword.trim() ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchKeyword;
    });

    return (
      <div className="at-home-care-container">
        {/* Header điều hướng */}
        <HomeHeader isShowBanner={false} />

        {/* HERO SECTION */}
        <section className="at-home-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fa fa-shield"></i> Dịch vụ Y tế & Chăm sóc Tận nơi 24/7
            </div>
            <h1 className="hero-title">
              Chăm Sóc Sức Khỏe Tại Nhà <span>Toàn Diện & Chu Đáo</span>
            </h1>
            <p className="hero-subtitle">
              Bác sĩ đến tận nhà thăm khám, kỹ thuật viên lấy mẫu xét nghiệm, điều dưỡng tiêm truyền &amp; chăm sóc vết thương.
              Không phải xếp hàng chen lấn, an toàn, vô khuẩn tuyệt đối, nhận kết quả online.
            </p>

            {/* Thanh tìm kiếm nhanh */}
            <div className="hero-search-wrapper">
              <div className="search-bar-inner">
                <i className="fa fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Tìm dịch vụ: lấy máu, khám nhi, truyền dịch, vật lý trị liệu, thay băng..."
                  value={searchKeyword}
                  onChange={this.handleSearchChange}
                />
                {searchKeyword && (
                  <button className="clear-btn" onClick={() => this.setState({ searchKeyword: "" })}>
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Thống kê nổi bật */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">4.9 / 5 <i className="fa fa-star star-icon"></i></div>
                <div className="stat-label">Hơn 15.000+ bệnh nhân tin chọn</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">30 - 45'</div>
                <div className="stat-label">Có mặt nhanh chóng tại nhà</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Bác sĩ &amp; Y tá có CCHN chuẩn</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">0 đ</div>
                <div className="stat-label">Phụ phí xăng xe nội thành</div>
              </div>
            </div>
          </div>
        </section>

        {/* DANH MỤC FILTER TABS */}
        <div className="categories-filter-wrapper">
          <div className="categories-container">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`category-tab ${selectedCategory === cat.key ? "active" : ""}`}
                onClick={() => this.handleCategoryChange(cat.key)}
              >
                <i className={`fa ${cat.icon}`}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN SERVICES GRID */}
        <section className="services-section">
          <div className="section-header">
            <div className="header-left">
              <h2>
                {selectedCategory === "ALL"
                  ? "Danh sách Dịch vụ Y tế Tại nhà"
                  : CATEGORIES.find((c) => c.key === selectedCategory)?.label}
              </h2>
              <span className="count-badge">{filteredServices.length} gói dịch vụ</span>
            </div>
            {searchKeyword && (
              <div className="search-filter-tag">
                Kết quả tìm kiếm cho: "<strong>{searchKeyword}</strong>"
                <button onClick={() => this.setState({ searchKeyword: "" })}>Xóa lọc</button>
              </div>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <div className="no-result">
              <i className="fa fa-search-minus"></i>
              <h3>Không tìm thấy dịch vụ phù hợp</h3>
              <p>Vui lòng thử lại với từ khóa khác hoặc chuyển sang danh mục khác.</p>
              <button
                className="btn-reset"
                onClick={() => this.setState({ selectedCategory: "ALL", searchKeyword: "" })}
              >
                Xem tất cả dịch vụ
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <div key={service.id} className="service-card">
                  {/* Card Header & Badge */}
                  <div className="card-top" style={{ background: service.gradient }}>
                    <div className="card-badge">{service.badge}</div>
                    <div className="card-icon-circle">
                      <i className={`fa ${service.icon}`}></i>
                    </div>
                    <div className="card-category-tag">{service.categoryName}</div>
                  </div>

                  {/* Card Content */}
                  <div className="card-body">
                    <h3 className="service-title" onClick={() => this.handleOpenDetail(service)}>
                      {service.name}
                    </h3>
                    <p className="service-desc">{service.shortDesc}</p>

                    {/* Điểm nổi bật */}
                    <div className="service-features">
                      {service.inclusions.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="feature-item">
                          <i className="fa fa-check-circle"></i>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Metadata: Thời gian, Đánh giá */}
                    <div className="service-meta">
                      <div className="meta-time">
                        <i className="fa fa-clock-o"></i> {service.duration}
                      </div>
                      <div className="meta-rating">
                        <i className="fa fa-star"></i> {service.rating} ({service.reviewsCount})
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="service-pricing">
                      <div className="price-box">
                        <span className="price-label">Giá trọn gói tại nhà:</span>
                        <div className="price-val">
                          <span className="current-price">{this.formatCurrency(service.price)}</span>
                          {service.originalPrice && (
                            <span className="old-price">{this.formatCurrency(service.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="service-actions">
                      <button
                        className="btn-detail"
                        onClick={() => this.handleOpenDetail(service)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="btn-book-now"
                        onClick={() => this.handleOpenBooking(service)}
                      >
                        <i className="fa fa-calendar-plus-o"></i> Đặt hẹn ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUY TRÌNH 4 BƯỚC KHÁM TẠI NHÀ */}
        <section className="workflow-section">
          <div className="section-title-wrap text-center">
            <span className="sub-tag">ĐƠN GIẢN &amp; TIỆN LỢI</span>
            <h2>Quy Trình 4 Bước Đặt Lịch &amp; Khám Tại Nhà</h2>
            <p>Trải nghiệm dịch vụ y tế chuẩn viện ngay tại phòng khách nhà bạn</p>
          </div>

          <div className="workflow-grid">
            {WORKFLOW_STEPS.map((s, idx) => (
              <div key={idx} className="workflow-step-card">
                <div className="step-num">{s.step}</div>
                <div className="step-icon-box">
                  <i className={`fa ${s.icon}`}></i>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {idx < WORKFLOW_STEPS.length - 1 && <div className="step-arrow">➜</div>}
              </div>
            ))}
          </div>
        </section>

        {/* CAM KẾT CHẤT LƯỢNG / TẠI SAO CHỌN */}
        <section className="why-choose-section">
          <div className="why-choose-container">
            <div className="why-left">
              <span className="sub-tag">UY TÍN &amp; TẬN TÂM</span>
              <h2>Tại Sao Hơn 15.000+ Khách Hàng Chọn Khám Tại Nhà Trên BookingCare?</h2>
              <p>
                Chúng tôi mang đến trải nghiệm chăm sóc y tế chủ động, giảm thiểu rủi ro lây nhiễm chéo tại bệnh viện
                đông đúc, đặc biệt phù hợp cho người cao tuổi, trẻ nhỏ và người có lịch trình bận rộn.
              </p>

              <div className="features-list">
                <div className="feature-row">
                  <div className="icon-wrap bg-blue"><i className="fa fa-certificate"></i></div>
                  <div>
                    <h4>100% Nhân viên y tế có chứng chỉ hành nghề</h4>
                    <p>Bác sĩ và điều dưỡng đến từ các bệnh viện lớn (Bạch Mai, Chợ Rẫy, ĐH Y Dược...), lý lịch minh bạch.</p>
                  </div>
                </div>

                <div className="feature-row">
                  <div className="icon-wrap bg-green"><i className="fa fa-clock-o"></i></div>
                  <div>
                    <h4>Đúng giờ, không phải xếp hàng chờ đợi</h4>
                    <p>Nhân viên có mặt theo đúng khung giờ bạn chọn, thời gian thăm khám kỹ lưỡng, không vội vã.</p>
                  </div>
                </div>

                <div className="feature-row">
                  <div className="icon-wrap bg-purple"><i className="fa fa-shield"></i></div>
                  <div>
                    <h4>Trang thiết bị vô trùng đạt chuẩn Bộ Y tế</h4>
                    <p>Dụng cụ tiêu hao 1 lần, kim tiêm, bông băng gạc khử trùng tuyệt đối, an toàn vệ sinh tối đa.</p>
                  </div>
                </div>

                <div className="feature-row">
                  <div className="icon-wrap bg-orange"><i className="fa fa-tag"></i></div>
                  <div>
                    <h4>Chi phí niêm yết rõ ràng - Không phụ phí</h4>
                    <p>Mức giá công khai trọn gói, xuất hóa đơn VAT điện tử nếu khách hàng yêu cầu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="why-right">
              <div className="banner-card-box">
                <div className="banner-top-accent"></div>
                <h3>Cần Tư Vấn Dịch Vụ Tại Nhà?</h3>
                <p>Đội ngũ bác sĩ và chuyên viên y tế luôn sẵn sàng giải đáp thắc mắc và hỗ trợ đặt hẹn miễn phí.</p>
                <div className="hotline-badge">
                  <i className="fa fa-phone"></i> 1900-2805 (Miễn cước)
                </div>
                <div className="working-hours">
                  <i className="fa fa-clock-o"></i> Hoạt động: 06:30 - 21:30 (Cả Thứ 7, CN &amp; Ngày Lễ)
                </div>
                <button
                  className="btn-call-support"
                  onClick={() => alert("Đang kết nối tới tổng đài hỗ trợ BookingCare: 1900-2805")}
                >
                  <i className="fa fa-headphones"></i> Gọi Tổng Đài Tư Vấn Ngay
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CÂU HỎI THƯỜNG GẶP FAQ */}
        <section className="faq-section">
          <div className="section-title-wrap text-center">
            <span className="sub-tag">GIẢI ĐÁP NHANH</span>
            <h2>Câu Hỏi Thường Gặp Về Dịch Vụ Tại Nhà</h2>
            <p>Những thông tin quan trọng giúp bạn an tâm khi sử dụng dịch vụ y tế tại nhà</p>
          </div>

          <div className="faq-accordion-wrap">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaqIndex === idx ? "expanded" : ""}`}
                onClick={() => this.toggleFaq(idx)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <i className={`fa ${openFaqIndex === idx ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                </div>
                {openFaqIndex === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MODAL CHI TIẾT DỊCH VỤ */}
        {selectedService && (
          <Modal
            show={isOpenDetailModal}
            onHide={this.handleCloseDetail}
            centered
            size="lg"
            className="at-home-modal"
          >
            <div className="modal-header-custom" style={{ background: selectedService.gradient }}>
              <div className="header-info">
                <span className="modal-badge">{selectedService.categoryName}</span>
                <h2>{selectedService.name}</h2>
              </div>
              <button className="close-x-btn" onClick={this.handleCloseDetail}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="modal-body-custom">
              <div className="modal-price-strip">
                <div className="price-item">
                  <span className="lbl">Giá dịch vụ trọn gói tại nhà:</span>
                  <span className="val">{this.formatCurrency(selectedService.price)}</span>
                  {selectedService.originalPrice && (
                    <span className="old">{this.formatCurrency(selectedService.originalPrice)}</span>
                  )}
                </div>
                <div className="time-item">
                  <i className="fa fa-clock-o"></i> Thời lượng: <strong>{selectedService.duration}</strong>
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fa fa-info-circle"></i> Giới thiệu dịch vụ</h4>
                <p>{selectedService.shortDesc}</p>
              </div>

              <div className="modal-section">
                <h4><i className="fa fa-check-square-o"></i> Danh mục quyền lợi bao gồm trong gói</h4>
                <ul className="detail-inclusions">
                  {selectedService.inclusions.map((inc, i) => (
                    <li key={i}>
                      <i className="fa fa-check"></i> {inc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-section">
                <h4><i className="fa fa-users"></i> Đối tượng phù hợp</h4>
                <p className="highlight-box">{selectedService.targetAudience}</p>
              </div>

              <div className="modal-section">
                <h4><i className="fa fa-bell-o"></i> Lưu ý chuẩn bị trước khi nhân viên y tế đến</h4>
                <p className="warning-box">{selectedService.preparation}</p>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button className="btn-cancel" onClick={this.handleCloseDetail}>
                Đóng
              </button>
              <button
                className="btn-proceed"
                onClick={() => this.handleOpenBooking(selectedService)}
              >
                <i className="fa fa-calendar-check-o"></i> Đặt lịch hẹn dịch vụ này
              </button>
            </div>
          </Modal>
        )}

        {/* MODAL ĐẶT LỊCH DỊCH VỤ TẠI NHÀ */}
        {selectedService && (
          <Modal
            show={isOpenBookingModal}
            onHide={this.handleCloseBooking}
            centered
            size="lg"
            className="at-home-modal booking-modal"
          >
            <div className="modal-header-custom" style={{ background: selectedService.gradient }}>
              <div className="header-info">
                <span className="modal-badge">ĐẶT LỊCH HẸN TẬN NHÀ</span>
                <h2>{selectedService.name}</h2>
              </div>
              <button className="close-x-btn" onClick={this.handleCloseBooking}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="modal-body-custom">
              {bookingSuccess ? (
                /* MÀN HÌNH XÁC NHẬN THÀNH CÔNG */
                <div className="booking-success-wrap">
                  <div className="success-icon-animated">
                    <i className="fa fa-check"></i>
                  </div>
                  <h3>ĐẶT LỊCH KHÁM TẠI NHÀ THÀNH CÔNG!</h3>
                  <p className="success-sub">
                    Nhân viên y tế BookingCare đã tiếp nhận yêu cầu và sẽ gọi điện xác nhận trong vòng <strong>5 - 10 phút</strong>.
                  </p>

                  <div className="booking-summary-receipt">
                    <div className="receipt-row">
                      <span>Mã phiếu hẹn:</span>
                      <strong className="code-text">{confirmedBookingData.bookingCode}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Dịch vụ:</span>
                      <strong>{confirmedBookingData.serviceName}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Người bệnh:</span>
                      <strong>{confirmedBookingData.patientName}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Số điện thoại:</span>
                      <strong>{confirmedBookingData.patientPhone}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Địa chỉ phục vụ:</span>
                      <strong>{confirmedBookingData.patientAddress}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Thời gian hẹn:</span>
                      <strong className="time-text">
                        {confirmedBookingData.slotLabel} — {confirmedBookingData.bookingDate}
                      </strong>
                    </div>
                    <div className="receipt-row">
                      <span>Hình thức thanh toán:</span>
                      <span>{confirmedBookingData.paymentMethod}</span>
                    </div>
                    <div className="receipt-row total-row">
                      <span>Tổng tiền dịch vụ:</span>
                      <strong className="total-amount">{this.formatCurrency(confirmedBookingData.price)}</strong>
                    </div>
                  </div>

                  <div className="success-buttons">
                    <button className="btn-done" onClick={this.handleCloseBooking}>
                      Hoàn tất
                    </button>
                    <button
                      className="btn-view-all"
                      onClick={() => {
                        this.handleCloseBooking();
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                    >
                      Đặt thêm dịch vụ khác
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM ĐIỀN THÔNG TIN ĐẶT LỊCH */
                <form onSubmit={this.handleFormSubmit} className="booking-form">
                  <div className="service-quick-summary">
                    <div className="sum-left">
                      <strong>Gói dịch vụ đã chọn:</strong>
                      <div className="serv-name">{selectedService.name}</div>
                    </div>
                    <div className="sum-right">
                      <span className="price-tag">{this.formatCurrency(selectedService.price)}</span>
                      <span className="dur-tag"><i className="fa fa-clock-o"></i> {selectedService.duration}</span>
                    </div>
                  </div>

                  <div className="form-group-section">
                    <div className="section-head">
                      <i className="fa fa-user"></i> Thông tin Người Nhận Dịch Vụ
                    </div>
                    <div className="form-row-2">
                      <div className="input-field">
                        <label>Họ và tên người bệnh <span className="req">*</span></label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={patientName}
                          onChange={(e) => this.handleInputChange("patientName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-field">
                        <label>Số điện thoại liên hệ <span className="req">*</span></label>
                        <input
                          type="tel"
                          placeholder="Ví dụ: 0912345678"
                          value={patientPhone}
                          onChange={(e) => this.handleInputChange("patientPhone", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="input-field">
                        <label>Giới tính</label>
                        <div className="gender-options">
                          <label className={`radio-pill ${patientGender === "M" ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="gender"
                              value="M"
                              checked={patientGender === "M"}
                              onChange={() => this.handleInputChange("patientGender", "M")}
                            />
                            <span><i className="fa fa-mars"></i> Nam</span>
                          </label>
                          <label className={`radio-pill ${patientGender === "F" ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="gender"
                              value="F"
                              checked={patientGender === "F"}
                              onChange={() => this.handleInputChange("patientGender", "F")}
                            />
                            <span><i className="fa fa-venus"></i> Nữ</span>
                          </label>
                        </div>
                      </div>

                      <div className="input-field">
                        <label>Năm sinh / Tuổi</label>
                        <input
                          type="number"
                          placeholder="Ví dụ: 1988"
                          value={patientBirthYear}
                          onChange={(e) => this.handleInputChange("patientBirthYear", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-field full-width">
                      <label>Địa chỉ phục vụ tại nhà cụ thể <span className="req">*</span></label>
                      <input
                        type="text"
                        placeholder="Số nhà, ngõ/ngách, tên đường, Phường/Xã, Quận/Huyện..."
                        value={patientAddress}
                        onChange={(e) => this.handleInputChange("patientAddress", e.target.value)}
                        required
                      />
                      <span className="field-hint">
                        <i className="fa fa-map-marker"></i> Nhân viên y tế sẽ đến đúng địa chỉ này để thăm khám.
                      </span>
                    </div>
                  </div>

                  <div className="form-group-section">
                    <div className="section-head">
                      <i className="fa fa-clock-o"></i> Thời Gian Mong Muốn Phục Vụ
                    </div>

                    <div className="form-row-2">
                      <div className="input-field">
                        <label>Chọn ngày phục vụ <span className="req">*</span></label>
                        <input
                          type="date"
                          min={this.getDefaultDate()}
                          value={bookingDate}
                          onChange={(e) => this.handleInputChange("bookingDate", e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label>Chọn khung giờ đến nhà <span className="req">*</span></label>
                        <div className="slots-grid-small">
                          {TIME_SLOTS.map((s) => (
                            <button
                              type="button"
                              key={s.key}
                              className={`slot-chip ${bookingSlot === s.key ? "active" : ""}`}
                              onClick={() => this.handleInputChange("bookingSlot", s.key)}
                            >
                              <span className="p-tag">{s.period}</span>
                              <span className="t-tag">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="input-field full-width">
                      <label>Mô tả triệu chứng / Ghi chú đặc biệt cho Bác sĩ</label>
                      <textarea
                        rows="2"
                        placeholder="Ví dụ: Sốt 38.5 độ từ hôm qua, người mệt mỏi, ho khan..."
                        value={bookingSymptoms}
                        onChange={(e) => this.handleInputChange("bookingSymptoms", e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group-section">
                    <div className="section-head">
                      <i className="fa fa-credit-card"></i> Hình Thức Thanh Toán
                    </div>
                    <div className="payment-options-grid">
                      <label className={`payment-card ${paymentMethod === "CASH" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="CASH"
                          checked={paymentMethod === "CASH"}
                          onChange={() => this.handleInputChange("paymentMethod", "CASH")}
                        />
                        <div className="pay-icon"><i className="fa fa-money"></i></div>
                        <div className="pay-info">
                          <strong>Tiền mặt tại nhà</strong>
                          <span>Thanh toán trực tiếp cho nhân viên sau khi hoàn thành dịch vụ</span>
                        </div>
                      </label>

                      <label className={`payment-card ${paymentMethod === "TRANSFER_QR" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="TRANSFER_QR"
                          checked={paymentMethod === "TRANSFER_QR"}
                          onChange={() => this.handleInputChange("paymentMethod", "TRANSFER_QR")}
                        />
                        <div className="pay-icon"><i className="fa fa-qrcode"></i></div>
                        <div className="pay-info">
                          <strong>Chuyển khoản QR ngân hàng</strong>
                          <span>Quét mã VietQR trên ứng dụng ngân hàng nhanh chóng &amp; chính xác</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-submit-footer">
                    <div className="total-preview">
                      <span>Tổng chi phí dịch vụ:</span>
                      <strong>{this.formatCurrency(selectedService.price)}</strong>
                    </div>
                    <div className="action-btns">
                      <button type="button" className="btn-cancel" onClick={this.handleCloseBooking}>
                        Hủy
                      </button>
                      <button type="submit" className="btn-confirm-booking" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span><i className="fa fa-spinner fa-spin"></i> Đang xử lý...</span>
                        ) : (
                          <span><i className="fa fa-check-circle"></i> Xác nhận Đặt Lịch Ngay</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        )}

        {/* FOOTER */}
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    patientInfo: state.patient.patientInfo,
  };
};

export default connect(mapStateToProps)(AtHomeCarePage);

