import { LayoutRectangle } from 'react-native';

// Interface định nghĩa một điểm trên lưới
export interface Dot {
    row: number;
    col: number;
    type: 'blue' | 'red';
}

// Interface mở rộng từ Dot, thêm thông tin về vị trí trên màn hình
export interface DotLayout extends Dot {
    layout: LayoutRectangle;
}

// Các hướng di chuyển có thể có: lên, xuống, trái, phải
export const possibleMoves = [
    { row: -1, col: 0 }, // Lên
    { row: 1, col: 0 },  // Xuống
    { row: 0, col: -1 }, // Trái
    { row: 0, col: 1 },  // Phải
];

// Trạng thái của game
export type GameStatus = 'playing' | 'success' | 'failure';