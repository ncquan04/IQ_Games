import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function ContinueIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 25 24"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M7.5 17.88V6.12c0-.863.836-1.4 1.502-.966l9.003 5.88c.66.432.66 1.5 0 1.932l-9.003 5.88c-.666.435-1.502-.103-1.502-.966z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default ContinueIcon
