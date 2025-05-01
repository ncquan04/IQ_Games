import { Dimensions } from 'react-native';
import { Disc } from './types';

// Các thông số cố định của trò chơi
export const discHeight = 20;      // Chiều cao của mỗi đĩa
export const discSpacing = 1;      // Khoảng cách giữa các đĩa
export const towerWidth = Dimensions.get('window').width / 3;  // Chiều rộng của mỗi tháp
export const towerHeight = 180;    // Chiều cao của mỗi tháp
export const colors = ['#3498DB', '#F39C12', '#E74C3C', '#1ABC9C', '#9B59B6', '#2ECC71', '#E67E22', '#34495E', '#E84393', '#00B894']; // Màu sắc của các đĩa
export const maxDiscWidth = towerWidth * 0.9;  // Chiều rộng tối đa của đĩa
export const minDiscWidth = maxDiscWidth * 0.4; // Chiều rộng tối thiểu của đĩa

/**
 * Tính toán chiều rộng của đĩa dựa vào id và id lớn nhất
 */
export const calculateDiscWidth = (id: number, maxId: number) => {
    if (maxId === 0) return maxDiscWidth; // Trường hợp chỉ có 1 đĩa

    // Công thức tính toán chiều rộng dựa trên id và id lớn nhất
    // Đảo ngược tỷ lệ để id càng cao thì đĩa càng lớn
    const ratio = 1 - ((maxId - id) / maxId);
    return minDiscWidth + ratio * (maxDiscWidth - minDiscWidth);
};

/**
 * Lấy màu sắc cho đĩa dựa vào id
 */
export const getDiscColor = (id: number) => {
    return colors[id % colors.length];
};

/**
 * Tính toán vị trí của đĩa dựa vào thông số của tháp
 */
export const getDiscPosition = (
    tower: Disc[],
    towerIndex: number,
    positionInTower: number,
    discWidth: number,
    totalDiscsInTower: number,
    isSelected: boolean
) => {
    // Tính toán vị trí X dựa vào chỉ số tháp và chiều rộng đĩa
    const x = towerWidth * towerIndex + (towerWidth - discWidth) / 2;
    // Tính toán vị trí Y dựa vào vị trí trong tháp
    let y = 180 - 40 - (totalDiscsInTower - 1 - positionInTower) * (discHeight + discSpacing);

    // Nâng đĩa lên khi được chọn
    if (isSelected) {
        y -= towerHeight - (tower.length * discHeight) - 15; // Nâng lên một chút để tạo cảm giác nổi
    }

    return { x, y };
};