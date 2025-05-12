/**
 * Component Numpad - Bàn phím số cho trò chơi PhoneNumbers
 * Chức năng:
 * - Hiển thị các phím số từ 0-9 để người chơi nhập số điện thoại
 * - Nút xóa để xóa số đã nhập
 * - Nút gửi để kiểm tra kết quả
 * - Vô hiệu hóa phím khi đang hiển thị số điện thoại
 */
import { View, Text, TouchableOpacity } from 'react-native'
import React, { RefObject } from 'react'
import BackspaceIcon from '../icons/BackspaceIcon'

/**
 * Props cho component Numpad
 * @param currentInputRef Tham chiếu đến mảng lưu các số đã nhập
 * @param triggerRerender Hàm kích hoạt render lại UI
 * @param checkResult Hàm kiểm tra kết quả
 * @param showNumberRef Tham chiếu đến trạng thái đang hiển thị số hay không
 */
interface NumpadProps {
    currentInputRef: RefObject<string[]>;
    triggerRerender: () => void;
    checkResult: () => void;
    showNumberRef: RefObject<boolean>;
}

const Numpad = ({ currentInputRef, triggerRerender, checkResult, showNumberRef }: NumpadProps) => {
    /**
     * Xử lý sự kiện khi người dùng nhấn phím số
     * @param number Số được nhấn (0-9)
     */
    const handleNumberPress = (number: number) => {
        const currentInput = currentInputRef.current;
        // Tìm vị trí trống đầu tiên để điền số vào
        const emptyIndex = currentInput.findIndex(item => item === '');
        if (emptyIndex !== -1) {
            currentInput[emptyIndex] = number.toString();
            triggerRerender();
        }
    }

    /**
     * Xử lý sự kiện khi người dùng nhấn nút xóa
     * Xóa số cuối cùng đã nhập
     */
    const handleDeletePress = () => {
        if (currentInputRef.current.length === 0) return;

        const currentInput = currentInputRef.current;
        // Tìm vị trí cuối cùng có số
        let lastFilledIndex = currentInput.length - 1;
        while (lastFilledIndex >= 0 && currentInput[lastFilledIndex] === '') {
            lastFilledIndex--;
        }
        
        if (lastFilledIndex >= 0) {
            currentInput[lastFilledIndex] = '';
            triggerRerender();
        }
    }

    /**
     * Xử lý sự kiện khi người dùng nhấn nút gửi
     * Gọi hàm kiểm tra kết quả
     */
    const handleSubmitPress = () => {
        checkResult();
    }

    return (
        <View style={{width: '100%', backgroundColor: '#113840', paddingVertical: 20, paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>            {/* Hàng đầu tiên của bàn phím: phím 1-3 */}
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current} // Vô hiệu hóa khi đang hiển thị số
                    onPress={() => handleNumberPress(1)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(2)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(3)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>3</Text>
                </TouchableOpacity>
            </View>            {/* Hàng thứ hai của bàn phím: phím 4-6 */}
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(4)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(5)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(6)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>6</Text>
                </TouchableOpacity>
            </View>            {/* Hàng thứ ba của bàn phím: phím 7-9 */}
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(7)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(8)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(9)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>9</Text>
                </TouchableOpacity>
            </View>            {/* Hàng cuối của bàn phím: nút xóa, phím 0, và nút gửi */}
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {/* Nút xóa số */}
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: 'rgba(35, 108, 122, 0.3)', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    onPress={() => handleDeletePress()}
                >
                    <BackspaceIcon width={30} height={30} fill={'#fff'}/>
                </TouchableOpacity>
                {/* Phím số 0 */}
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(0)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>0</Text>
                </TouchableOpacity>
                {/* Nút gửi kết quả - vô hiệu hóa khi chưa nhập đủ số */}
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: currentInputRef.current.some(item => item === '') ? 'rgba(35, 108, 122, 0.3)' : 'rgba(42, 244, 86, 0.8)', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    onPress={() => handleSubmitPress()}
                    disabled={currentInputRef.current.some(item => item === '')}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Numpad