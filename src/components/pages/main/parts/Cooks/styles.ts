import { CSSProperties } from 'react'


export const list_styles: CSSProperties = {
  marginTop: '0.5rem',
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'scroll',
  overflowY: 'hidden',
}
export const wrapper_styles: CSSProperties = {
  padding: '0.5rem 0 0.5rem 0.5rem'
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
  border: '2px solid var(--tg-theme-text-color)'
}
export const cookNameStyle = {
  color: 'var(--громкий-текст)',
  fontSize: '18px'
}