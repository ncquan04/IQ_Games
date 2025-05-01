/**
 * Interface định nghĩa cấu trúc của một đĩa trong trò chơi
 * - id: định danh duy nhất của đĩa, dùng để xác định kích thước
 */
export interface Disc {
    id: number;
}

/**
 * Interface chứa thông tin về đĩa đang trong quá trình di chuyển giữa các tháp
 * - id: định danh của đĩa đang di chuyển
 * - sourceTower: chỉ số của tháp nguồn
 * - targetTower: chỉ số của tháp đích
 */
export interface FlyingDiscInfo {
    id: number;
    sourceTower: number;
    targetTower: number;
}

/**
 * Props cho component AnimatedDisc
 */
export interface AnimatedDiscProps {
    disc: Disc;
    x: number;
    y: number;
    isFlying?: boolean;
    nextTowerIndex: number;
    towers: Disc[][];
    maxId: number;
}

/**
 * Props cho component Tower
 */
export interface TowerProps {
    index: number;
    onPress: (index: number) => void;
    isDisabled: boolean;
    width: number;
    height: number;
}

/**
 * Props cho component GameControls
 */
export interface GameControlsProps {
    onPrevLevel: () => void;
    onResetLevel: () => void;
    onNextLevel: () => void;
    isDisabled: boolean;
}

/**
 * Level definition
 */
export interface Level {
    map: Disc[][];
    difficulty: string;
}