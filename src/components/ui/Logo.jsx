import wordmark from '../../assets/logo-wordmark.png'
import mark from '../../assets/logo-mark.png'

// variant="wordmark": full "terasync" logo (used in headers/sidebars)
// variant="mark": just the icon glyph (used in tight/square spots)
export default function Logo({ variant = 'wordmark', className = 'h-7 w-auto' }) {
  const src = variant === 'mark' ? mark : wordmark
  return <img src={src} alt="TeraSync" className={className} />
}
