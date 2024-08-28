import { FC } from 'react'

export const IconDown: FC<{ color: any, width: any, height: any }> = props =>
  <svg
    width={props.width}
    height={props.height}
    viewBox={`0 0 ${props.width} ${props.height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
  <path
    d="M9.54 1.344L8.932 0.64C7.88667 1.03467 6.60133 1.888 5.076 3.2C3.59333 1.90933 2.30267 1.056 1.204 0.64L0.612 1.344C0.878666 1.952 1.48667 2.74133 2.436 3.712C3.37467 4.69333 4.25467 5.41867 5.076 5.888C5.89733 5.41867 6.78267 4.69333 7.732 3.712C8.67067 2.74133 9.27333 1.952 9.54 1.344Z"
    fill={props.color}
  />
  </svg>
