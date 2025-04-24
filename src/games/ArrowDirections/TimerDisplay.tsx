import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TimerDisplayProps {
    initialTime: number;
    onTimeUp: () => void;
    gameId?: number; // Thêm gameId để biết khi nào cần reset timer thật sự
}

/**
 * TimerDisplay Component
 * 
 * Displays and manages the countdown timer for the game.
 * Updates every 100ms and calls onTimeUp when the timer reaches zero.
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({ initialTime, onTimeUp, gameId }) => {
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

    useEffect(() => {
        // Chỉ khởi tạo timer khi component được mount lần đầu hoặc khi gameId thay đổi
        // (đồng nghĩa với việc bắt đầu trò chơi mới)
        if (!hasInitializedRef.current || gameId !== lastGameIdRef.current) {
            // Cập nhật refs
            hasInitializedRef.current = true;
            lastGameIdRef.current = gameId;
            
            // Reset timer
            gameTimeMsRef.current = initialTime;
            setTimeRemaining(initialTime);
            hasCalledTimeUpRef.current = false;

            // Clear existing timer
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
            }

            // Set up timer update at 100ms intervals
            gameTimerRef.current = setInterval(() => {
                // Update remaining time
                if (gameTimeMsRef.current - 100 >= 0) {
                    gameTimeMsRef.current -= 100;
                    setTimeRemaining(gameTimeMsRef.current);
                } else {
                    // Time's up
                    gameTimeMsRef.current = 0;
                    setTimeRemaining(0);
                    
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
        }

        // Cleanup timer on unmount
        return () => {
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
                gameTimerRef.current = null;
            }
        };
    }, [gameId]); // Chỉ phụ thuộc vào gameId thay vì initialTime

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