import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TimerDisplayProps {
    initialTime: number;
    onTimeUp: () => void;
    gameId?: number; // Thêm gameId để biết khi nào cần reset timer thật sự
    onTimeUpdate?: (remainingTime: number) => void; // Callback để cập nhật thời gian còn lại
}

/**
 * TimerDisplay Component
 * 
 * Displays and manages the countdown timer for the game.
 * Updates every 100ms and calls onTimeUp when the timer reaches zero.
 * Now also provides remainingTime updates to parent component to sync with progress bar.
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({ initialTime, onTimeUp, gameId, onTimeUpdate }) => {
    // State to track remaining time for display
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    
    // Refs to track actual timer values and prevent multiple timeUp calls
    const gameTimeMsRef = useRef<number>(initialTime);
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasCalledTimeUpRef = useRef<boolean>(false);
    const hasInitializedRef = useRef<boolean>(false);
    const lastGameIdRef = useRef<number | undefined>(gameId);

    /**
     * Format milliseconds into a MM:SS display format
     */
    const formatTime = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        return `0:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Hàm để khởi tạo lại timer khi bắt đầu trò chơi mới
    const resetTimer = () => {
        // Clear existing timer
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
        }

        // Reset timer state
        gameTimeMsRef.current = initialTime;
        setTimeRemaining(initialTime);
        hasCalledTimeUpRef.current = false;

        // Thông báo thời gian ban đầu cho component cha
        if (onTimeUpdate) {
            onTimeUpdate(initialTime);
        }

        // Set up timer update at 100ms intervals
        gameTimerRef.current = setInterval(() => {
            // Update remaining time
            if (gameTimeMsRef.current - 100 >= 0) {
                gameTimeMsRef.current -= 100;
                setTimeRemaining(gameTimeMsRef.current);
                
                // Thông báo thời gian còn lại cho component cha để đồng bộ progress bar
                if (onTimeUpdate) {
                    onTimeUpdate(gameTimeMsRef.current);
                }
            } else {
                // Time's up
                gameTimeMsRef.current = 0;
                setTimeRemaining(0);
                
                // Thông báo thời gian còn lại bằng 0 cho component cha
                if (onTimeUpdate) {
                    onTimeUpdate(0);
                }
                
                // Call onTimeUp callback when time reaches 0 (only once)
                if (!hasCalledTimeUpRef.current) {
                    hasCalledTimeUpRef.current = true;
                    onTimeUp();
                }
                
                // Stop the timer
                if (gameTimerRef.current) {
                    clearInterval(gameTimerRef.current);
                    gameTimerRef.current = null;
                }
            }
        }, 100);
    };

    useEffect(() => {
        // Khởi tạo timer khi component được mount lần đầu hoặc khi gameId thay đổi
        if (!hasInitializedRef.current || gameId !== lastGameIdRef.current) {
            // Cập nhật refs
            hasInitializedRef.current = true;
            lastGameIdRef.current = gameId;
            
            // Khởi tạo lại timer
            resetTimer();
        }

        // Cleanup timer on unmount
        return () => {
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
                gameTimerRef.current = null;
            }
        };
    }, [gameId]); // Chỉ phụ thuộc vào gameId để khởi động lại timer

    return (
        <Text style={styles.timerText}>
            {formatTime(timeRemaining)}
        </Text>
    );
};

const styles = StyleSheet.create({
    timerText: {
        position: 'absolute',
        top: 45,
        right: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default React.memo(TimerDisplay);