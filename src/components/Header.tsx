/**
 * Component Header - Hiển thị thanh đầu của trò chơi PhoneNumbers
 * Bao gồm:
 * - Nút tạm dừng trò chơi
 * - Hiển thị thông tin cấp độ và điểm số
 * - Nút hiển thị hướng dẫn
 */
/**
 * Component Header - Phần đầu của trò chơi PhoneNumbers
 * Chức năng:
 * - Hiển thị thông tin cấp độ và điểm số hiện tại
 * - Cung cấp nút tạm dừng trò chơi
 * - Cung cấp nút hiển thị hướng dẫn
 */
import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import PauseIcon from '../assets/icons/PauseIcon'
import QuestionMarkIcon from '../assets/icons/QuestionMarkIcon'
import { ModalBaseRef } from './ModalBase';

/**
 * Props cho component Header
 * @param currentLevel Cấp độ hiện tại của trò chơi
 * @param totalLevels Tổng số cấp độ trong độ khó hiện tại
 * @param currentScore Điểm số hiện tại của người chơi
 * @param pauseModalRef Tham chiếu đến modal tạm dừng
 * @param instructionModalRef Tham chiếu đến modal hướng dẫn
 */
interface HeaderProps {
    currentLevel: number;
    totalLevels: number;
    currentScore: number;
    pauseModalRef?: React.RefObject<ModalBaseRef>;
    instructionModalRef?: React.RefObject<ModalBaseRef>;
}

const Header = ({ currentLevel, totalLevels, currentScore, pauseModalRef, instructionModalRef }: HeaderProps) => {

    return (
        <View style={{ width: '100%', paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Nút tạm dừng trò chơi */}
            <TouchableOpacity
                style={{ width: 40, height: 40, backgroundColor: '#236c7a', borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => pauseModalRef?.current.show()}
            >
                <PauseIcon width={20} height={20} fill={'#fff'} />
            </TouchableOpacity>
            {/* Khu vực hiển thị thông tin cấp độ và điểm số */}
            <View style={{ width: '70%', paddingHorizontal: 10, backgroundColor: '#0a1f24', borderRadius: 30, paddingVertical: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>                
                <View />
                {/* Hiển thị thông tin cấp độ hiện tại và tổng số cấp độ */}
                <View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>{currentLevel} / {totalLevels}</Text>
                </View>
                {/* Hiển thị điểm số hiện tại */}
                <View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>{currentScore}</Text>
                </View>
            </View>
            {/* Nút hiển thị hướng dẫn cách chơi */}
            <TouchableOpacity
                style={{ width: 40, height: 40, backgroundColor: '#236c7a', borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => instructionModalRef?.current.show()}
            >
                <QuestionMarkIcon width={20} height={20} fill={'#fff'} />
            </TouchableOpacity>
        </View>
    )
}

export default Header