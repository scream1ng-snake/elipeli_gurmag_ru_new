import { CSSProperties } from 'react'


export const list_styles: CSSProperties = {
  marginTop: '10px',
  marginLeft: '-0.25rem',
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'scroll',
  overflowY: 'hidden',
  scrollbarWidth: 'none'
}
export const wrapper_styles: CSSProperties = {
  /* padding: '0.5rem 0 0.5rem 0.5rem', */
  marginBottom: '26px',
  marginLeft: '16px'
}

export const wrapperStyle = {
  width: '33%',
  margin: '0 0.25rem',
  '--gap': '3px',
}
export const avatarStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '35px',
  objectFit: 'cover',
  border: '1px solid var(--gur-border-color)',
  boxSizing: 'border-box',
}
export const cookNameStyle = {
  color: 'var(--громкий-текст)',
  fontSize: '18px'
}