import { useImperativeHandle, useRef, useState } from "react";
import { Dimensions, Modal, ModalProps, StatusBar, View } from "react-native";

export interface ModalBaseRef {
    show: () => void;
    hide: () => void;
}

interface ModalBaseProps extends ModalProps {
    children: React.ReactNode;
    ref: React.Ref<ModalBaseRef>;
    onRequestClose?: () => void;
}

const ModalBase = ({children, ref, onRequestClose}: ModalBaseProps) => {
    const [visible, setVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        show,
        hide
    }))

    const show = () => {
        setVisible(true);
    }

    const hide = () => {
        setVisible(false);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
            visible={visible}
            onRequestClose={onRequestClose ? onRequestClose : () => hide()}
        >
                <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c535e', paddingTop: StatusBar.currentHeight}}>
                    {children}
                </View>
        </Modal>
    )
}

export default ModalBase;