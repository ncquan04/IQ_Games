// animationConfig.ts - Cấu hình các tham số thời gian và hiệu ứng động cho trò chơi Strange Signals
// Bao gồm thời gian hiệu ứng xuất hiện/biến mất của ô, đá quý, hiệu ứng chuyển màu, delay chuyển màn...

// Cấu hình thời gian và tham số hiệu ứng cho trò chơi Hidden Gems
export const ANIMATION_CONFIG = {
  // Hiệu ứng xuất hiện/biến mất của các ô lưới
  TILE_FADE_IN_DURATION: 200,   // Thời gian (ms) để ô lưới hiện ra
  TILE_FADE_OUT_DURATION: 200,  // Thời gian (ms) để ô lưới biến mất
  TILE_DELAY_INCREMENT: 50,     // Độ trễ (ms) giữa mỗi ô lưới khi xuất hiện tuần tự
  
  // Hiệu ứng xuất hiện/biến mất của đá quý
  GEM_FADE_IN_DURATION: 200,    // Thời gian (ms) để đá quý hiện ra
  GEM_FADE_OUT_DURATION: 200,   // Thời gian (ms) để đá quý biến mất
  
  // Hiệu ứng chuyển màu nền
  COLOR_TRANSITION_DURATION: 200, // Thời gian (ms) để chuyển đổi giữa các màu sắc
  
  // Độ trễ khi chuyển màn
  LEVEL_TRANSITION_DELAY: 2000, // Thời gian chờ (ms) trước khi bắt đầu màn chơi mới
  
  // Thời gian đệm thêm để đảm bảo hiệu ứng hoàn tất
  ANIMATION_BUFFER: 0,         // Thời gian đệm (ms) cho các hiệu ứng
};
