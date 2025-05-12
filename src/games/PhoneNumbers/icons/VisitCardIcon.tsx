/**
 * VisitCardIcon - Icon thẻ liên hệ
 * Sử dụng trong trò chơi PhoneNumbers để hiển thị hình nền thẻ liên hệ
 * chứa tên và số điện thoại cần ghi nhớ
 */
import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

/**
 * Component SVG thẻ liên hệ
 * @param props Props của SVG từ react-native-svg
 */
function VisitCardIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 379.03 271.81"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M360.92 0H18.11C8.11 0 0 8.11 0 18.11V253.7c0 10 8.11 18.11 18.11 18.11h342.81c10 0 18.11-8.11 18.11-18.11V18.11c0-10-8.11-18.11-18.11-18.11zM75.89 88.59c1.18-21.06 19.21-37.18 40.27-36s37.18 19.21 36 40.27-19.21 37.18-40.27 36-37.18-19.21-36-40.27zm97.61 115.79H54.55v-36.36c0-8.87 5.49-16.82 13.78-19.97l24.48-9.28h2.27c5.59 3.2 12.04 5.05 18.94 5.05s13.35-1.85 18.94-5.05h2.27l24.48 9.28c8.3 3.15 13.78 11.1 13.78 19.97v36.36zm123.44-35.47h-64.07a8.03 8.03 0 110-16.06h64.07a8.03 8.03 0 110 16.06zm30.76-44.24h-94.83a8.03 8.03 0 110-16.06h94.83a8.03 8.03 0 110 16.06z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default VisitCardIcon
