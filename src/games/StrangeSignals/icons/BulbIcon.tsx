// BulbIcon.tsx - Component SVG biểu tượng bóng đèn (bulb) dùng để hiển thị đá quý trong lưới Strange Signals
// Cho phép tuỳ chỉnh màu sắc qua props, sử dụng react-native-svg
import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BulbIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 48 48"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M17.1 34.2c.1.8.2 1.5.2 2.3h13.4c0-.8.1-1.6.2-2.3zm.2 4.3V42c0 .6.4 1 1 1h.3c.5 2.5 2.8 4.5 5.4 4.5 2.7 0 4.9-1.9 5.4-4.5h.3c.6 0 1-.4 1-1v-3.5zm5.9-38c-7.1.4-13 6-13.8 13.1-.4 4 .8 7.9 3.3 10.9 1.9 2.3 3.3 4.9 4 7.6h14.6c.7-2.7 2.1-5.4 4-7.7 2.2-2.6 3.4-5.9 3.4-9.3 0-8.3-7.1-15-15.5-14.6z"
                data-original="#000000"
                fill={props.fill ?? "#000000"}
            />
        </Svg>
    )
}

export default BulbIcon
