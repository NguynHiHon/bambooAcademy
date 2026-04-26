const OpenAI = require('openai');
const dayjs = require('dayjs');
require('dayjs/locale/vi');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const getSpecialOccasion = (date) => {
    const month = date.month() + 1;
    const day = date.date();

    if (month === 2 && day === 14) return 'Ngày Valentine (Lễ tình nhân) ❤️';
    if (month === 3 && day === 8) return 'Ngày Quốc tế Phụ nữ (8/3) 💐';
    if (month === 10 && day === 20) return 'Ngày Phụ nữ Việt Nam (20/10) 🌹';
    if (month === 11 && day === 20) return 'Ngày Nhà giáo Việt Nam (20/11) 👨‍🏫';
    if (month === 12 && day === 24) return 'Lễ Giáng sinh 🎄';
    if (month === 1 && day === 1) return 'Tết Dương lịch 🎆';
    
    // Ngày kỷ niệm cá nhân
    if (month === 8 && day === 7) return 'Ngày sinh nhật của người yêu Hải Hoàn (Ngày quan trọng nhất thế gian!) 🎂🎉';
    if (month === 11 && day === 1) return 'Ngày sinh nhật của Hải Hoàn 🎂';
    if (month === 2 && day === 5) return 'Kỷ niệm ngày yêu nhau của Hải Hoàn và người thương (Giao lộ định mệnh) ❤️💍';

    // Ngày lễ Việt Nam khác
    if (month === 4 && day === 30) return 'Ngày Giải phóng miền Nam (30/4) 🇻🇳';
    if (month === 5 && day === 1) return 'Ngày Quốc tế Lao động (1/5)';
    if (month === 9 && day === 2) return 'Ngày Quốc khánh Việt Nam (2/9) 🇻🇳';

    // Xử lý Tết Nguyên Đán (Dự đoán theo dương lịch cho vài năm tới)
    const year = date.year();
    if (year === 2026 && month === 2 && day >= 17 && day <= 20) return 'Những ngày Tết Nguyên Đán (Năm Bính Ngọ) 🧧🧨';
    if (year === 2027 && month === 2 && day >= 6 && day <= 9) return 'Những ngày Tết Nguyên Đán (Năm Đinh Mùi) 🧧🧨';
    if (year === 2028 && month === 1 && day >= 26 && day <= 29) return 'Những ngày Tết Nguyên Đán (Năm Mậu Thân) 🧧🧨';
    return null;
};

const getSeason = (month) => {
    if (month >= 2 && month <= 4) return 'Mùa Xuân (Mùa của chồi non và tình yêu)';
    if (month >= 5 && month <= 7) return 'Mùa Hạ (Mùa phượng vĩ và những kỷ niệm)';
    if (month >= 8 && month <= 10) return 'Mùa Thu (Mùa lá vàng rụng, lãng mạn nhẹ nhàng)';
    return 'Mùa Đông (Mùa lạnh giá cần hơi ấm từ người thương)';
};

const getTimeOfDay = (hour) => {
    if (hour >= 5 && hour < 11) return 'Buổi Sáng (Khởi đầu ngày mới tràn đầy năng lượng)';
    if (hour >= 11 && hour < 14) return 'Buổi Trưa (Thời gian nghỉ ngơi thư giãn)';
    if (hour >= 14 && hour < 18) return 'Buổi Chiều (Hoàng hôn lãng mạn)';
    return 'Buổi Tối (Thời gian dành cho những suy nghĩ tình cảm và giấc ngủ ngon)';
};

const romanticAiController = {
    getGreeting: async (req, res) => {
        try {
            const now = dayjs();
            const hour = now.hour();
            const month = now.month() + 1;
            const occasion = getSpecialOccasion(now);
            const season = getSeason(month);
            const timeOfDay = getTimeOfDay(hour);

            const prompt = `Bạn là một sứ giả tình yêu, thay mặt cho Hải Hoàn (một người con trai Việt Nam ấm áp) để gửi những lời yêu thương đến người yêu của anh ấy khi cô ấy truy cập vào "Bamboo Academy".
Hôm nay là: ${now.format('DD/MM/YYYY')}
Bối cảnh: ${timeOfDay}, ${season}.
Dịp đặc biệt: ${occasion || 'Ngày thường nhưng tình yêu Hải Hoàn dành cho em vẫn luôn đặc biệt'}.

Nhiệm vụ: Hãy tạo ra một lời nhắn nhủ ngắn gọn (tối đa 40 từ) thể hiện sự quan tâm ấm áp và chân thành của Hải Hoàn dành cho người yêu. 
Yêu cầu:
1. **PHONG CÁCH:** Ngôn ngữ hiện đại, tự nhiên, gần gũi (như cách hai người yêu nhau quan tâm nhau hàng ngày). Tuyệt đối tránh các từ ngữ quá sến súa, cổ hủ hay "kịch" (ví dụ: KHÔNG dùng 'đêm xuân', 'thiên đàng', 'nàng'...).
2. **NỘI DUNG:** Quan tâm một cách tự nhiên theo ngữ cảnh (không cần liệt kê tên mùa hay buổi một cách máy móc):
    - Hãy dặn em giữ ấm, nghỉ ngơi, uống nước hoặc hỏi thăm hôm nay em thế nào dựa trên thời gian và thời tiết hiện tại.
    - Tập trung vào cảm xúc chân thành, sự đồng hành và thấu hiểu.
3. **GIA VỊ (ĐA DẠNG):** Sử dụng linh hoạt ca dao, thơ lục bát hoặc những câu văn vần Việt Nam. Tuyệt đối KHÔNG sử dụng lặp lại các câu quá quen thuộc. Mỗi lần nhắn phải là một ý tưởng mới.
4. **CHỮ KÝ:** Luôn xuống dòng và kết thúc bằng: "Người thương: Hải Hoàn".
5. Trả về kết quả là một đoạn văn bản thuần túy.

Ví dụ: "Hôm nay em có chuyện gì vui không? Đừng làm việc quá sức nhé, anh luôn ở đây ủng hộ em. Yêu nhau mấy núi cũng trèo, chỉ mong em luôn bình an và vui vẻ như thế này. \n\nNgười thương: Hải Hoàn"`;

            const response = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 200,
            });

            const greeting = response.choices[0].message.content.trim();

            return res.status(200).json({
                status: 'success',
                greeting,
            });
        } catch (error) {
            console.error('Romantic AI Error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Chào em, chúc em một ngày tốt lành từ Hải Hoàn!',
            });
        }
    }
};

module.exports = romanticAiController;
