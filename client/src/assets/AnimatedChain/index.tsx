import * as React from 'react'

import styles from './style.module.scss'

const AnimatedChain = ({ fill, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg height="100px" viewBox="0 0 100 100" width="100px" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" fill={fill} r="50" />
      <g>
        <title>Layer 1</title>
        <path
          className={styles.animatedChainOne}
          d="m26.43,78.77c0,0 0,0 0,0l-6.96,-6.59c-3.11,-2.95 -3.11,-7.76 0,-10.72l13.05,-12.37c3.11,-2.95 8.19,-2.95 11.3,0l6.96,6.59c3.11,2.95 3.11,7.76 0,10.72l-13.05,12.37c-3.11,2.95 -8.19,2.95 -11.3,0zm3.47,-3.29c1.2,1.14 3.16,1.14 4.37,0l13.05,-12.37c1.21,-1.15 1.21,-3 0,-4.14l-6.95,-6.59c-1.2,-1.14 -3.16,-1.14 -4.37,0l-13.05,12.37c-1.21,1.14 -1.21,3 0,4.14l6.95,6.59l0,0z"
          fill="#E0E0E2"
          id="svg_3"
          transform="matrix(1 0 0 1 0 0)"
        />
        <g className={styles.animatedChainOne} id="svg_4" transform="matrix(1 0 0 1 0 0)">
          <polygon fill="#C7C5CA" id="svg_5" points="29.863712787628174,75.418949842453 29.863474369049072,75.41884303092957 29.863474369049072,75.41884303092957 " />
          <path
            d="m50.73,55.55l-3.47,-3.31l-3.46,3.3l3.47,3.31c1.21,1.15 1.21,3.01 0,4.15l-13.04,12.41c-1.2,1.14 -3.16,1.14 -4.37,0l0,0l0,0l0,0l-3.47,-3.31l-3.46,3.3l3.47,3.31c0,0 0,0 0,0c3.11,2.96 8.18,2.96 11.29,0l13.04,-12.41c3.11,-2.96 3.11,-7.79 0,-10.75z"
            fill="#C7C5CA"
            id="svg_6"
          />
        </g>
        <path
          className={styles.animatedChainOne3}
          d="m57.96,49.66c0,0 0,0 0,0l-6.96,-6.59c-3.11,-2.95 -3.11,-7.76 0,-10.72l13.05,-12.37c3.11,-2.95 8.19,-2.95 11.3,0l6.96,6.59c3.11,2.95 3.11,7.76 0,10.72l-13.05,12.37c-3.11,2.95 -8.19,2.95 -11.3,0zm3.47,-3.29c1.2,1.14 3.16,1.14 4.37,0l13.05,-12.37c1.21,-1.15 1.21,-3 0,-4.14l-6.95,-6.59c-1.2,-1.14 -3.16,-1.14 -4.37,0l-13.05,12.37c-1.21,1.14 -1.21,3 0,4.14l6.95,6.59l0,0z"
          fill="#E0E0E2"
          id="svg_1"
          transform="matrix(1 0 0 1 0 0)"
        />
        <g className={styles.animatedChainOne3} id="svg_13" transform="matrix(1 0 0 1 0 0)">
          <polygon fill="#C7C5CA" id="svg_14" points="61.34431990981102,46.37049460411072 61.34408339858055,46.37038779258728 61.34408339858055,46.37038779258728 " />
          <path
            d="m82.21,26.51l-3.47,-3.31l-3.46,3.3l3.47,3.31c1.21,1.15 1.21,3.01 0,4.15l-13.04,12.41c-1.2,1.14 -3.16,1.14 -4.37,0l0,0l0,0l0,0l-3.47,-3.31l-3.46,3.3l3.47,3.31c0,0 0,0 0,0c3.11,2.96 8.18,2.96 11.29,0l13.04,-12.41c3.11,-2.96 3.11,-7.79 0,-10.75z"
            fill="#C7C5CA"
            id="svg_15"
          />
        </g>
        <path
          className={styles.animatedChainOne2}
          d="m40.07,62.28c-0.94,0 -1.89,-0.34 -2.6,-1.02c-1.44,-1.36 -1.44,-3.57 0,-4.92l20.93,-19.78c1.44,-1.36 3.77,-1.36 5.21,0c1.44,1.36 1.44,3.57 0,4.92l-20.93,19.78c-0.72,0.68 -1.66,1.02 -2.6,1.02l0,0z"
          fill="#797680"
          id="svg_7"
        />
        <path
          className={styles.animatedChainOne2}
          d="m63.71,36.54l-26.22,24.84c0.72,0.68 1.67,1.03 2.61,1.03c0.94,0 1.89,-0.34 2.61,-1.03l20.99,-19.89c1.45,-1.37 1.45,-3.59 0,-4.95l0,0z"
          fill="#56565C"
          id="svg_8"
        />
      </g>
    </svg>
  )
}

export default AnimatedChain
