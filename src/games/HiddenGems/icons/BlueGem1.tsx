import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BlueGem1(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 512 512"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                fill="#96fff6"
                d="M0 166a14.875 14.875 0 003.794 9.961l241 270-12.114-149.633L166 166 54.375 136z"
                data-original="#96fff6"
            />
            <Path
                fill="#76e2f8"
                d="M267.206 445.961l241.307-270c2.525-2.831 3.495-6.37 3.487-9.961l-72.655-30-93.244 30-64.996 124.048z"
                data-original="#76e2f8"
            />
            <Path
                fill="#76e2f8"
                d="M256 136l-90 30 78.794 279.961a14.978 14.978 0 0022.412 0L346 166z"
                data-original="#76e2f8"
            />
            <Path
                fill="#66c0ee"
                d="M346 166l-90-30v315c4.277 0 8.364-1.831 11.206-5.039zm90-105H256l26.603 66.037L346 166l72.947-45.669 24.128-57.557A14.993 14.993 0 00436 61z"
                data-original="#66c0ee"
            />
            <Path
                fill="#76e2f8"
                d="M76 61c-2.505 0-4.929.626-7.075 1.774l29.22 62.972L166 166l80.073-58.419L256 61z"
                data-original="#76e2f8"
            />
            <Path
                fill="#3aaaff"
                d="M448.48 67.68a14.997 14.997 0 00-5.405-4.905L346 166h166a15.033 15.033 0 00-2.52-8.32z"
                data-original="#3aaaff"
            />
            <Path
                fill="#66c0ee"
                d="M68.925 62.774a14.99 14.99 0 00-5.405 4.905l-61 90A15.039 15.039 0 000 166h166z"
                data-original="#66c0ee"
            />
            <Path
                fill="#96fff6"
                d="M266.607 65.393A14.95 14.95 0 00256 61c-3.84 0-7.678 1.463-10.607 4.393L166 166h180z"
                data-original="#96fff6"
            />
            <Path
                fill="#76e2f8"
                d="M266.607 65.393A14.95 14.95 0 00256 61v105h90z"
                data-original="#76e2f8"
            />
        </Svg>
    )
}

export default BlueGem1
