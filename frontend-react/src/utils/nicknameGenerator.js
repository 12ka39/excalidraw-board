// utils/nicknameGenerator.js
const adjectives = [
  "행복한", "신나는", "즐거운", "귀여운", "멋진",
  "따뜻한", "엉뚱한", "용감한", "지혜로운", "친절한",
  "활발한", "재미있는", "상냥한", "씩씩한", "기분좋은"
];

const nouns = [
  "판다", "코알라", "사자", "토끼", "고양이",
  "강아지", "펭귄", "돌고래", "기린", "여우",
  "다람쥐", "햄스터", "고래", "카피바라", "알파카"
];

export const generateNickname = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
};
