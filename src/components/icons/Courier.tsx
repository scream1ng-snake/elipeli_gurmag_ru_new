import { FC } from 'react'

const CourierIcon: FC<{ fontSize: any, color: any }> = props =>
  <svg
    viewBox="0 0 62 62"
    width="1em"
    height="1em"
    fill="currentColor"
    fontSize={props.fontSize}
    color={props.color}
  >
    <path d="m39.213 11.99h2.464v2.877h-2.464z" />
    <path d="m43.256 15.689c0 .453-.354.821-.789.821h-4.043c-.436 0-.789-.368-.789-.821v-3.699h-2.745v9.538h11.11v-9.538h-2.744z" />
    <path d="m41.446 23.175h-10.94c-.464 0-.828-.436-.786-.899.106-1.157-.167-4.118-.448-4.873-.91-2.444-4.976-2.775-7.097-2.748-2.218.029-5.474.5-5.737 3.318-.649 6.965-.578 13.345.218 19.506.148 1.149.831 2.059 2.029 2.704.253.136.415.403.426.699.228 6.396.248 12.747.248 18.704 0 3.219 8.118 3.219 8.118 0 0-5.759-.021-12.453-.261-19.02-.011-.302.138-.586.387-.739.976-.599 2.096-1.667 1.879-3.349-.208-1.606.185-7.908.159-8.897-.01-.447.342-.843.789-.843h11.015c1.004 0 1.821-.799 1.821-1.781.001-.983-.816-1.782-1.82-1.782z" />
    <path d="m18.464 5.755c0 3.173 2.207 5.754 4.92 5.754s4.92-2.581 4.92-5.754c0-.076-.017-.146-.019-.22h-9.802c-.002.074-.019.144-.019.22z" />
    <path d="m31.06 3.892h-3.043c-.666-2.257-2.48-3.892-4.633-3.892s-3.967 1.635-4.633 3.892h9.265l.269 1.643h2.775c.436 0 .789-.368.789-.821s-.353-.822-.789-.822z" />
  </svg>

export default CourierIcon