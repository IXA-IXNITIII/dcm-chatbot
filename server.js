const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // เสิร์ฟไฟล์ Frontend

// ตั้งค่าการเชื่อมต่อ PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // จำเป็นสำหรับการเชื่อมต่อบน Cloud
});

// สร้างตารางเก็บประวัติแชทอัตโนมัติหากยังไม่มี
const initDB = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS chat_logs (
            id SERIAL PRIMARY KEY,
            user_message TEXT NOT NULL,
            bot_reply TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(createTableQuery);
};
//initDB();

// ตั้งค่า AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `
คุณคือ AI ผู้ช่วยแนะแนวการศึกษาของ "หลักสูตรสารสนเทศศาสตรบัณฑิต สาขาดิจิทัลคอนเทนต์และสื่อ" (Digital Content and Media) สำนักวิชาสารสนเทศศาสตร์ มหาวิทยาลัยวลัยลักษณ์
ข้อมูลหลักสูตร:
- ปรัชญา: มุ่งผลิตบัณฑิตให้มีสมรรถนะด้านดิจิทัลคอนเทนต์ เชี่ยวชาญเทคโนโลยี มีคุณธรรม
- จุดเด่น: จัดการคอนเทนต์ดิจิทัลกลุ่มหอศิลป์ ห้องสมุด พิพิธภัณฑ์ (Digital GLAM), สหกิจศึกษา 8 เดือน, ได้มาตรฐานสากล UKPSF
- อาชีพ: Digital Content Creator, Web Content Manager, Digital Collection Developer, Web Designer
- ค่าธรรมเนียม: 25,000 บาท/เทอม (รวมตลอดหลักสูตร 200,000 บาท)
- โครงสร้าง: 123 หน่วยกิต เลือกเรียนภาษาจีนหรืออังกฤษได้ 

กฎสำคัญในการตอบ:
1. หากผู้ใช้ถามเป็นภาษาไทย ให้ตอบเป็นภาษาไทย
2. หากผู้ใช้ถามเป็นภาษาอังกฤษ ให้ตอบเป็นภาษาอังกฤษ (Translate the program details accurately into English)
3. ตอบคำถามอย่างเป็นมิตร สุภาพ และอ้างอิงจากข้อมูลหลักสูตรเป็นหลัก
`;

// API Endpoint สำหรับแชท
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-pro',
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const botReply = response.text;

        //บันทึกการสนทนาลง Database
        await pool.query(
            'INSERT INTO chat_logs (user_message, bot_reply) VALUES ($1, $2)',
            [userMessage, botReply]
        );

        res.json({ reply: botReply });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งครับ" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});